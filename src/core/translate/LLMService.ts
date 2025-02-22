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

interface ProviderConfig {
    url: string;
    headers: Record<string, string>;
    requestBody: any;
}

interface ProviderConfigGenerator {
    generateConfig(text: string, model: string, temperature: number, apiToken?: string): ProviderConfig;
}

class OllamaConfigGenerator implements ProviderConfigGenerator {
    generateConfig(text: string, model: string, temperature: number): ProviderConfig {
        return {
            url: 'http://localhost:8000',
            headers: { 'Content-Type': 'application/json' },
            requestBody: {
                messages: [
                    {
                        role: "user",
                        content: `${text} 将以上内容翻译为英文`
                    }
                ],
                model: model,
                temperature: temperature,
                stream: true
            }
        };
    }
}

class SiliconFlowConfigGenerator implements ProviderConfigGenerator {
    generateConfig(text: string, model: string, temperature: number, apiToken?: string): ProviderConfig {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };
        if (apiToken) {
            headers['Authorization'] = `Bearer ${apiToken}`;
        }

        return {
            url: 'https://api.siliconflow.cn/v1/chat/completions',
            headers,
            requestBody: {
                model,
                messages: [
                    {
                        role: "user",
                        content: `${text} 将以上markdown内容翻译为英文，且保持markdown格式不变`
                    }
                ],
                stream: true,
                max_tokens: 2048,
                stop: ["null"],
                temperature: temperature,
                top_p: 0.7,
                top_k: 50,
                frequency_penalty: 0.5,
                n: 1,
                response_format: {
                    type: "text"
                }
            }
        };
    }
}

export class LLMService {
    private url: string;
    private model: string;
    private temperature: number;
    private apiToken: string;
    private provider: string;
    private providerConfigGenerators: Map<string, ProviderConfigGenerator>;

    constructor() {
        const config = vscode.workspace.getConfiguration('markdownAssistant.LLM');
        this.provider = config.get('provider') || 'local';
        this.url = config.get('apiUrl') || 'http://localhost:8000';
        this.model = config.get('model') || 'deepseek-r1:1.5b';
        this.temperature = config.get('temperature') || 0.7;
        this.apiToken = config.get('apiToken') || '';

        // 初始化服务商配置生成器
        this.providerConfigGenerators = new Map([
            ['ollama', new OllamaConfigGenerator()],
            ['siliconflow', new SiliconFlowConfigGenerator()]
        ]);
    }

    private extractContent(response: ModelResponse): string {
        if (response.message?.content) {
            return response.message.content;
        } else if (response.choices?.[0]?.message?.content) {
            return response.choices[0].message.content;
        }
        throw new Error('不支持的响应格式');
    }

    async translate(text: string, targetFilePath: string): Promise<void> {
        try {
            fs.writeFileSync(targetFilePath, '');

            const configGenerator = this.providerConfigGenerators.get(this.provider);
            if (!configGenerator) {
                throw new Error(`不支持的服务商: ${this.provider}`);
            }

            const config = configGenerator.generateConfig(text, this.model, this.temperature, this.apiToken);
            console.log('[info: 128]:', { config})
            const response = await axios.post<ModelResponse>(config.url, config.requestBody, {
                responseType: 'stream',
                headers: config.headers,
                httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
            });

            let isInThinkBlock = false;
            (response.data as any).on('data', (chunk: Buffer) => {
                const lines = chunk.toString().split('\n');
                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            let jsonData = line;
                            if (line.startsWith('data: ')) {
                                jsonData = line.substring(6);
                            }
                            const data = JSON.parse(jsonData) as ModelResponse;
                            if (!data.done) {
                                const content = this.extractContent(data);
                                if (content.includes('<think>')) {
                                    isInThinkBlock = true;
                                    continue;
                                } else if (content.includes('</think>')) {
                                    isInThinkBlock = false;
                                    continue;
                                }
                                
                                if (!isInThinkBlock) {
                                    fs.appendFileSync(targetFilePath, content);
                                }
                            }
                        } catch (e) {
                            console.warn('解析响应行失败:', line, e);
                        }
                    }
                }
            });

            (response.data as any).on('error', (error: Error) => {
                fs.unlinkSync(targetFilePath);
                throw error;
            });

            await new Promise<void>((resolve, reject) => {
                (response.data as any).on('end', resolve);
                (response.data as any).on('error', reject);
            });

        } catch (error) {
            if (fs.existsSync(targetFilePath)) {
                fs.unlinkSync(targetFilePath);
            }
            console.error('Translation error:', error);
            throw new Error(this.provider === 'local' ? '本地模型翻译失败' : '在线模型翻译失败');
        }
    }
}