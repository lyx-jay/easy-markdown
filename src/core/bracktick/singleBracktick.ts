import * as vscode from "vscode";
import { processInlineText } from "../../utils/text-util";

export function handleAddbacktickSeparately() {
      // 获取当前打开的编辑窗口
      const editor = vscode.window.activeTextEditor!;

      // 获取当前打开的文档，只处理 Markdown 文件
      const document = editor.document;

      // 如果当前有选中的文本,则只对选中的文本进行处理
      const selection = editor.selection;
      const selectedText = document.getText(selection);
      if (selectedText) {
        const processedText = processInlineText(selectedText, "single");
        editor.edit((builder) => {
          builder.replace(selection, processedText);
        });
      } else {
        vscode.window.showInformationMessage(
          "please select the text you want to process"
        );
      }
}

export function registerProcessInlineCodeCommand() {
  return vscode.commands.registerCommand("markdown-assistant.single", handleAddbacktickSeparately);
}