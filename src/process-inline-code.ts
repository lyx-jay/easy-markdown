import * as vscode from 'vscode';

const processInlineText = (text: string, type: 'single' | 'batch' = 'batch') => {
  if (type === 'single') {
    return '`' + text + '`';
  }
  let newText = text;
  // 只考虑单词边界情况，同时忽略已有反引号包裹的内容或加粗显示的内容
  newText = newText.replace(/\b(?<!`)(?<!\*\*)([a-zA-Z0-9_\-.]+)\b(?!`)(?!\*\*)/g, '`$1`');
  return newText;
};

export function registerProcessInlineCodeCommand() {

  const singleChange = vscode.commands.registerCommand('easy-markdown.single', () => {
    // 获取当前打开的编辑窗口
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    // 获取当前打开的文档，只处理 Markdown 文件
    const document = editor.document;
    const fileType = document.languageId;
    if (fileType !== 'markdown') {
      return;
    }

    // 如果当前有选中的文本,则只对选中的文本进行处理
    const selection = editor.selection;
    const selectedText = document.getText(selection);
    if (selectedText) {
      // 进行处理并替换选中的文本
      const processedText = processInlineText(selectedText, 'single');
      editor.edit(builder => {
        builder.replace(selection, processedText);
      });
    }
  });

  return singleChange;
}


export function registerProcessBatchInlineCodeCommand() {
  const batchingChange = vscode.commands.registerCommand('easy-markdown.batching', () => {
    // 获取当前打开的编辑窗口
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    // 获取当前打开的文档，只处理 Markdown 文件
    const document = editor.document;
    const fileType = document.languageId;
    if (fileType !== 'markdown') {
      return;
    }

    // 如果当前有选中的文本,则只对选中的文本进行处理
    const selection = editor.selection;
    const selectedText = document.getText(selection);
    if (selectedText) {
      // 进行处理并替换选中的文本
      const processedText = processInlineText(selectedText);
      editor.edit(builder => {
        builder.replace(selection, processedText);
      });
      return;
    } else {
      vscode.window.showInformationMessage('暂不支持扫描整个文档，请选择有效的内容进行处理!');
    }
  });

  return batchingChange;

}

