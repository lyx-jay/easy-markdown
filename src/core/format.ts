import * as vscode from "vscode";
import { handleInsertSpace } from "./insertSpace/insertSpace";
import { handleAddbacktickBatch } from "./bracktick/batchBracktick";

async function handleFormatMarkdown() {
  const editor = vscode.window.activeTextEditor!;
  const document = editor.document;
  const words = vscode.workspace
    .getConfiguration()
    .get<string[]>("markdown.dict");

  words &&
    words.forEach((word: string) => {
      handleAddbacktickBatch(word);
    });
  await document.save();

  handleInsertSpace();
}

export default function formatMarkdown() {
  return vscode.commands.registerCommand(
    "markdown-assistant.formatMarkdown",
    handleFormatMarkdown
  );
}
