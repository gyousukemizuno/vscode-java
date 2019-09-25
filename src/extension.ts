import * as vscode from 'vscode';
import { JavaTools } from './JavaTools';

export function activate(context: vscode.ExtensionContext) {
	const controller = new JavaTools();
	context.subscriptions.push(vscode.commands.registerCommand('extension.switchPairClass', () => {
		controller.openPairClass();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('extension.newTestClass', () => {
		controller.newTestClass();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('extension.newPackage', (selectedFile:any | undefined) => {
		controller.newPackage(selectedFile);
	}));
	context.subscriptions.push(vscode.commands.registerCommand('extension.newClass', (selectedFile:any | undefined) => {
		controller.newClass(selectedFile);
	}));
	context.subscriptions.push(vscode.commands.registerCommand('extension.newInterface', (selectedFile:any | undefined) => {
		controller.newInterface(selectedFile);
	}));
	context.subscriptions.push(vscode.commands.registerCommand('extension.newEnum', (selectedFile:any | undefined) => {
		controller.newEnum(selectedFile);
	}));
	context.subscriptions.push(vscode.commands.registerCommand('extension.runTest', (selectedFile:any | undefined) => {
		const activeTextEditor = vscode.window.activeTextEditor;
		if (activeTextEditor === undefined) {
			return;
		}
		const currentPosition = activeTextEditor.selection.start;
		const wordRange = activeTextEditor.document.getWordRangeAtPosition(currentPosition);
		console.log(wordRange);
		console.log(activeTextEditor.document.getText(wordRange));
	}));
}

export function deactivate() { }
