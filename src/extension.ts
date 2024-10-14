import * as vscode from 'vscode';
import { registerInsertSpaceCommand } from './insert-space';
import { registerProcessInlineCodeCommand, registerProcessBatchInlineCodeCommand } from './process-inline-code';
import type MarkdownIt from 'markdown-it';
import mdEnhance from './md-enhance';




export const activate = (context: vscode.ExtensionContext) => {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		return;
	}
	const document = editor.document;
	const fileType = document.languageId;
	if (fileType !== 'markdown') {
		return;
	}
	const commands = [
		registerInsertSpaceCommand(),
		registerProcessInlineCodeCommand(),
		registerProcessBatchInlineCodeCommand()
	];
	// @ts-ignore
	context.subscriptions.push(...commands);

	return {
		extendMarkdownIt(md: MarkdownIt) {
			mdEnhance.forEach(plugin => {
				md.use(plugin);
			});
			return md;
		}
};
};

