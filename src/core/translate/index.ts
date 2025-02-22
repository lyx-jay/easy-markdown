import * as vscode from 'vscode';
import { LLMService } from './LLMService';
import * as path from 'path';

export function registerTranslateCommandUsingLocalLLM() {
    return vscode.commands.registerCommand('markdown-assistant.translateToEnglish', async () => {
        try {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }

            const document = editor.document;
            const text = document.getText();

            const currentFile = document.fileName;
            const dirName = path.dirname(currentFile);
            const baseName = path.basename(currentFile, '_zh.md');
            const englishFile = path.join(dirName, `${baseName}.md`);

            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "正在翻译文档...",
                cancellable: false
            }, async (progress) => {
                const llmService = new LLMService();
                await llmService.translate(text, englishFile);
                vscode.window.showInformationMessage(`翻译完成！文件已保存至: ${englishFile}`);

            });
        } catch (error) {
            vscode.window.showErrorMessage(`翻译失败: ${error}`);
        }
    });
}