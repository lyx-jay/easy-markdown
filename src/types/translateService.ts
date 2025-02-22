export interface SiliconFlowResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        delta: {
            content: string;
            reasoning_content: string | null;
        };
        finish_reason: string | null;
        content_filter_results: {
            hate: {
                filtered: boolean;
            };
            self_harm: {
                filtered: boolean;
            };
            sexual: {
                filtered: boolean;
            };
            violence: {
                filtered: boolean;
            };
        };
    }>;
    system_fingerprint: string;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}


export interface OllamaResponse {
    model: string;
    created_at?: string;
    message?: {
        role: string;
        content: string;
    };
    done?: boolean;
}

export interface ProviderConfig {
  url: string;
  headers: Record<string, string>;
  requestBody: any;
}

export interface ProviderConfigGenerator {
  generateConfig(text: string, model: string, temperature: number, apiToken?: string): ProviderConfig;
  handleResponse(response: SiliconFlowResponse | OllamaResponse): string;
}