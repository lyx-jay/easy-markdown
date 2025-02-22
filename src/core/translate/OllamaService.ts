import { OllamaResponse, ProviderConfig, ProviderConfigGenerator } from "../../types/translate";

export default class OllamaConfigGenerator implements ProviderConfigGenerator {
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
    handleResponse(response: OllamaResponse): string {
        return ''
    }
}