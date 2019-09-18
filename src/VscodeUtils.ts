// SPDX-License-Identifier: GPL-2.0
import * as vscode from 'vscode';

export class VscodeUtils {

  public static showTextDocument(path: string): void {
    const uri = vscode.Uri.parse(path);
    vscode.workspace.openTextDocument(uri).then(doc => {
      vscode.window.showTextDocument(doc);
    });
  }
}