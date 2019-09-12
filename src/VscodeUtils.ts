import * as vscode from 'vscode';

export class VscodeUtils {

  public static async showTextDocument(path: string): Promise<void> {
    const activeTextEditor = vscode.window.activeTextEditor;
    if (!activeTextEditor) {
      return;
    }
    const uri = activeTextEditor.document.uri.with({ path: path });
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc, { preview: false });
  }
}