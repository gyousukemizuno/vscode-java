import * as vscode from 'vscode';
import { JavaUtilController } from './JavaUtilController';

export function activate(context: vscode.ExtensionContext) {
	const controller = new JavaUtilController();
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
}

export function deactivate() { }
