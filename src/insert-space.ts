import * as vscode from 'vscode';

export function insertSpace(content: string) {
  // 在 “中文English” 之间加入空格 “中文 English”
  // 在 “中文123” 之间加入空格 “中文 123”
  content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF])([a-zA-Z0-9`])/g, '$1 $2');

  // 在 “English中文” 之间加入空格 “English 中文”
  // 在 “123中文” 之间加入空格 “123 中文”
  content = content.replace(/([a-zA-Z0-9%`])([*]*[\u4e00-\u9fa5\u3040-\u30FF])/g, "$1 $2");

  // 在 「100Gbps」之间加入空格「100 Gbps」（只有手工做，不能自动做，会破坏密码网址等信息）

  // 在 「I said:it's a good news」的冒号与英文之间加入空格 「I said: it's a good news」
  content = content.replace(/([:])\s*([a-zA-z])/g, "$1 $2");

  return content;

}

// 获取可编辑文档的全部内容
function currentDocumentRange(doc: vscode.TextDocument) {
  let start = new vscode.Position(0, 0);
  let end = new vscode.Position(doc.lineCount - 1, doc.lineAt(doc.lineCount - 1).text.length);
  let range = new vscode.Range(start, end);
  return range;
};

export function registerInsertSpaceCommand() {

  return vscode.commands.registerCommand("markdown-assistant.insertSpace", () => {
    const editor = vscode.window.activeTextEditor!;

    const document = editor.document;

    editor.edit(editBuilder => {

      const content = document.getText(currentDocumentRange(document));

      const updateContent = content.split('\n').map(line => insertSpace(line)).join('\n');

      editBuilder.replace(currentDocumentRange(document), updateContent);
    });


  });

}