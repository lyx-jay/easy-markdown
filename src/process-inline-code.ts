import * as vscode from "vscode";

const processInlineText = (
  text: string,
  type: "single" | "batch" = "batch"
) => {
  if (type === "single") {
    return "`" + text + "`";
  }
  let newText = text;
  // 只考虑单词边界情况，同时忽略已有反引号包裹的内容或加粗显示的内容
  newText = newText.replace(
    /\b(?<!`)(?<!\*\*)([a-zA-Z0-9_\-.]+)\b(?!`)(?!\*\*)/g,
    "`$1`"
  );
  return newText;
};

export function isTextInComment(text: string, markdownContent: string): boolean {
  const commentRegex = /<!--([\s\S]*?)-->/g;
  // console.log('isTextInComment', commentRegex.exec(markdownContent));
  let match;
  while ((match = commentRegex.exec(markdownContent))!== null) {
    if (match[1].includes(text)) {
      return true;
    }
  }
  return false;
}

export function isTextInCodeBlock(lineNumber: number, codeBlockRanges: number[][]): boolean {
  return codeBlockRanges.some(range => range[0] <= lineNumber && range[1] >= lineNumber);
}

export function isTextStartWithAchor(line: string) {
  if (line.startsWith("#")) {
    return true;
  } else {
    return false;
  }
}

export function queryCodeBlockRange(document: vscode.TextDocument) {
  const matches = [];
  const selectedText = '```';
  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    if (line.text.startsWith(selectedText)) {
      matches.push({ lineNumber: i, text: line.text });
    }
  }
  const res:number[][] = [];

  for (let i = 0; i < matches.length; i += 2) {
    res.push([matches[i].lineNumber, matches[i + 1].lineNumber]);
  }
  return res;
}



export function registerProcessInlineCodeCommand() {
  const singleChange = vscode.commands.registerCommand(
    "markdown-assistant.single",
    () => {
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
  );

  return singleChange;
}



export function registerProcessBatchInlineCodeCommand() {

  function getRangers(matcher: { lineNumber: number; text: string; }[], selectedText: string) {
    function findAllIndices(str:string, targetWord: string) {
      let indices = [];
      let index = str.indexOf(targetWord);
    
      while (index!== -1) {
        indices.push(index);
        index = str.indexOf(targetWord, index + 1);
      }
    
      return indices;
    }

    const ranges:vscode.Range[] = [];

    matcher.forEach(match => {
      
      const indices = findAllIndices(match.text, selectedText);

      const temp = indices.map(startColNum => {
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

  function getTextMatchers(document: vscode.TextDocument, selectedText: string, codeBlockRanges: number[][]) {
    const matches = [];
    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      if (line.text.includes(selectedText)) {
        matches.push({ lineNumber: i, text: line.text });
      }
    }
    const allText = document.getText();

    const textMatches = matches.filter(match => {
      return !isTextInCodeBlock(match.lineNumber, codeBlockRanges) && !isTextInComment(match.text, allText) && !isTextStartWithAchor(match.text);
    });

    return textMatches;
  }


  const batchingChange = vscode.commands.registerCommand(
    "markdown-assistant.batching",
    () => {
      // 获取当前打开的编辑窗口
      const editor = vscode.window.activeTextEditor!;

      // 获取当前打开的文档，只处理 Markdown 文件
      const document = editor.document;

      // 如果当前有选中的文本,则只对选中的文本进行处理
      const selection = editor.selection;
      const selectedText = document.getText(selection);
      
      if (selectedText) {

        const codeBlockRanges = queryCodeBlockRange(document);

        const textMatchers = getTextMatchers(document, selectedText, codeBlockRanges);

        const ranges = getRangers(textMatchers, selectedText);


        editor.edit(builder => {
          ranges.forEach(range => {
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
  );

  return batchingChange;
}

