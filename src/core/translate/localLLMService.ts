import axios from 'axios';
import * as vscode from 'vscode';
import * as fs from 'fs';

interface ModelResponse {
    model: string;
    created_at?: string;
    message?: {
        role: string;
        content: string;
    };
    choices?: Array<{
        message: {
            content: string;
        };
    }>;
    done?: boolean;
}

export class LocalLLMService {
    private url: string;
    private model: string;
    private temperature: number;

    constructor() {
        const config = vscode.workspace.getConfiguration('markdownAssistant.localLLM');
        this.url = config.get('api') || 'http://localhost:8000';
        this.model = config.get('model') || 'deepseek-r1:1.5b';
        this.temperature = config.get('temperature') || 0.7;
    }

    private extractContent(response: ModelResponse): string {
        if (response.message?.content) {
            // deepseek 等模型的返回格式
            return response.message.content;
        } else if (response.choices?.[0]?.message?.content) {
            // ChatGPT 等模型的返回格式
            return response.choices[0].message.content;
        }
        throw new Error('不支持的响应格式');
    }

    async translate(text: string, targetFilePath: string): Promise<void> {
        try {
            // 创建空文件
            fs.writeFileSync(targetFilePath, '');

            const response = await axios.post<ModelResponse>(`${this.url}`, {
                messages: [
                    {
                        role: "user",
                        content: `${text} 将以上内容翻译为英文`
                    }
                ],
                model: this.model,
                temperature: this.temperature,
                stream: true
            }, {
                responseType: 'stream'
            });

            // 处理流式响应
            let isInThinkBlock = false;
            (response.data as any).on('data', (chunk: Buffer) => {
                const lines = chunk.toString().split('\n');
                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const data = JSON.parse(line) as ModelResponse;
                            if (!data.done) {
                                const content = this.extractContent(data);
                                // fs.appendFileSync(targetFilePath, content);
                                // 检查是否进入或离开 think 块
                                if (content.includes('<think>')) {
                                    isInThinkBlock = true;
                                    continue;
                                } else if (content.includes('</think>')) {
                                    isInThinkBlock = false;
                                    continue;
                                }
                                
                                // 只有在不在 think 块中时才写入内容
                                if (!isInThinkBlock) {
                                    fs.appendFileSync(targetFilePath, content);
                                }
                            }
                        } catch (e) {
                            console.warn('解析响应行失败:', line);
                        }
                    }
                }
            });

            // 处理错误
            (response.data as any).on('error', (error: Error) => {
                fs.unlinkSync(targetFilePath);
                throw error;
            });

            // 等待流结束
            await new Promise<void>((resolve, reject) => {
                (response.data as any).on('end', resolve);
                (response.data as any).on('error', reject);
            });

        } catch (error) {
            // 发生错误时删除文件
            if (fs.existsSync(targetFilePath)) {
                fs.unlinkSync(targetFilePath);
            }
            console.error('Translation error:', error);
            throw new Error('本地模型翻译失败');
        }
    }
}