import * as vscode from 'vscode';
import { JavaUtilController } from './JavaUtilController';

export function activate(context: vscode.ExtensionContext) {
	const controller = new JavaUtilController();
	context.subscriptions.push(vscode.commands.registerCommand('extension.switchJavaPairClass', () => {
		controller.openPairClass();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('extension.newFileOfJavaTestClass', () => {
		controller.newFileOfJavaTestClass();
	}));
}

export function deactivate() { }
