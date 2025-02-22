import { ProviderConfig, SiliconFlowResponse } from "../../types/translateService";

export default class SiliconFlowConfigGenerator {
    generateConfig(text: string, model: string, temperature: number, apiToken?: string): ProviderConfig {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };
        if (apiToken) {
            headers['Authorization'] = `Bearer ${apiToken}`;
        }

        return {
            url: 'http://api.siliconflow.cn/v1/chat/completions',
            headers,
            requestBody: {
                model,
                messages: [
                    {
                        role: "user",
                        content: `${text} 将以上markdown内容翻译为英文，且保持markdown格式不变.翻译输出的结果不需要以代码块包裹`
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

    handleResponse(response: SiliconFlowResponse): string {
        if (!response.choices?.[0]) {
            throw new Error('Invalid response format: missing choices');
        }
        return response.choices[0].delta.content;
    }
}