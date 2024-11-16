import * as vscode from "vscode";
import {
  isTextInCodeBlock,
  isTextInComment,
  isTextStartWithAchor,
  processInlineText,
} from "../../utils/text-util";

function getRangers(
  matcher: { lineNumber: number; text: string }[],
  selectedText: string
) {
  function findAllIndices(str: string, targetWord: string) {
    let indices = [];
    let index = str.indexOf(targetWord);

    while (index !== -1) {
      indices.push(index);
      index = str.indexOf(targetWord, index + 1);
    }

    return indices;
  }

  const ranges: vscode.Range[] = [];

  matcher.forEach((match) => {
    const indices = findAllIndices(match.text, selectedText);

    const temp = indices.map((startColNum) => {
      const endColNum = startColNum + selectedText.length;
      const startPosition = new vscode.Position(match.lineNumber, startColNum);
      const endPosition = new vscode.Position(match.lineNumber, endColNum);
      const range = new vscode.Range(startPosition, endPosition);
      return range;
    });
    ranges.push(...temp);
  });

  return ranges;
}

function getTextMatchers(
  document: vscode.TextDocument,
  selectedText: string,
  codeBlockRanges: number[][]
) {
  const matches = [];
  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    if (line.text.includes(selectedText)) {
      matches.push({ lineNumber: i, text: line.text });
    }
  }
  const allText = document.getText();

  const textMatches = matches.filter((match) => {
    return (
      !isTextInCodeBlock(match.lineNumber, codeBlockRanges) &&
      !isTextInComment(match.text, allText) &&
      !isTextStartWithAchor(match.text)
    );
  });

  return textMatches;
}

function queryCodeBlockRange(document: vscode.TextDocument) {
  const matches = [];
  const selectedText = "```";
  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    if (line.text.startsWith(selectedText)) {
      matches.push({ lineNumber: i, text: line.text });
    }
  }
  const res: number[][] = [];

  for (let i = 0; i < matches.length; i += 2) {
    res.push([matches[i].lineNumber, matches[i + 1].lineNumber]);
  }
  return res;
}

export function handleAddbacktickBatch() {
  // 获取当前打开的编辑窗口
  const editor = vscode.window.activeTextEditor!;

  // 获取当前打开的文档，只处理 Markdown 文件
  const document = editor.document;

  // 如果当前有选中的文本,则只对选中的文本进行处理
  const selection = editor.selection;
  const selectedText = document.getText(selection);

  if (selectedText) {
    const codeBlockRanges = queryCodeBlockRange(document);

    const textMatchers = getTextMatchers(
      document,
      selectedText,
      codeBlockRanges
    );

    const ranges = getRangers(textMatchers, selectedText);

    editor.edit((builder) => {
      ranges.forEach((range) => {
        const processedText = processInlineText(selectedText);
        builder.replace(range, processedText);
      });
    });

    return;
  } else {
    vscode.window.showInformationMessage(
      "please select the text you want to process"
    );
  }
}

export function registerProcessBatchInlineCodeCommand() {
  return vscode.commands.registerCommand("markdown-assistant.batching", handleAddbacktickBatch);
}
