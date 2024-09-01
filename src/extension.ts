import * as vscode from 'vscode';
import { registerInsertSpaceCommand } from './insert-space';
import { registerProcessInlineCodeCommand, registerProcessBatchInlineCodeCommand } from './process-inline-code';

export const activate = (context: vscode.ExtensionContext) => {

	const commands = [
		registerInsertSpaceCommand(),
		registerProcessInlineCodeCommand(),
		registerProcessBatchInlineCodeCommand()
	];
	// @ts-ignore
	context.subscriptions.push(...commands);
};
