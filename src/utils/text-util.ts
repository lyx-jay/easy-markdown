export function isTextStartWithAchor(line: string) {
  if (line.startsWith("#")) {
    return true;
  } else {
    return false;
  }
}

export function isTextInCodeBlock(lineNumber: number, codeBlockRanges: number[][]): boolean {
  return codeBlockRanges.some(range => range[0] <= lineNumber && range[1] >= lineNumber);
}

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


export const processInlineText = (
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
