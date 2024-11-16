// vscode.workspace.getConfiguration('myExtension')
import * as vscode from "vscode";



function addWordToDictionary() {
  const workspace = vscode.workspace.getConfiguration();
  const config = workspace.get<string[]>("markdown.dict");
  if (!config) {
    workspace.update("markdown.dict", [], vscode.ConfigurationTarget.Global);
  }

  // 获取当前打开的编辑窗口
  const editor = vscode.window.activeTextEditor!;

  // 获取当前打开的文档，只处理 Markdown 文件
  const document = editor.document;

  // 如果当前有选中的文本,则只对选中的文本进行处理
  const selection = editor.selection;
  const selectedText = document.getText(selection);

  if (selectedText) {
    workspace.update("markdown.dict", [...config!, selectedText], vscode.ConfigurationTarget.Global).then(res => {
      vscode.window.showInformationMessage('add word success');
      console.log("dict", workspace.get<string[]>("markdown.dict"));
    });
  } else {
    vscode.window.showInformationMessage(
      "please select the text you want to process"
    );
  }

}

export function registerAddWordCommand() {
  return vscode.commands.registerCommand(
    "markdown-assistant.addWordToDictionary",
    addWordToDictionary
  );
}
