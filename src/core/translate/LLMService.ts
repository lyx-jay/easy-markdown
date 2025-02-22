import axios from 'axios';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { ProviderConfigGenerator } from '../../types/translateService';
import OllamaConfigGenerator from './OllamaService';
import SiliconFlowConfigGenerator from './SiliconFlow';

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


    async translate(text: string, targetFilePath: string): Promise<void> {
        try {
            fs.writeFileSync(targetFilePath, '');

            const configGenerator = this.providerConfigGenerators.get(this.provider);
            if (!configGenerator) {
                throw new Error(`不支持的服务商: ${this.provider}`);
            }

            const config = configGenerator.generateConfig(text, this.model, this.temperature, this.apiToken);
            
            const response = await axios.post(config.url, config.requestBody, {
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
                            const data = JSON.parse(jsonData);
                            if (!data.done) {
                                const content = configGenerator.handleResponse(data);

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