import * as vscode from 'vscode';
import * as fs from 'fs';
import { FileUtils } from './FileUtils';
import { VscodeUtils } from './VscodeUtils';

export class JavaUtilController {

  constructor() {
  }

  private getPairClass(fileName: string): string {
    const rootPath = vscode.workspace.rootPath;
    const index = fileName.lastIndexOf('.');
    if (fileName.lastIndexOf('Test.java') === -1) {
      return fileName.replace(rootPath + '/src/main/java', rootPath + '/src/test/java').substring(0, index) + "Test.java";
    } else {
      return fileName.replace(rootPath + '/src/test/java', rootPath + '/src/main/java').substring(0, index - 4) + ".java";
    }
  }

  async openPairClass(): Promise<void> {
    const activeTextEditor = vscode.window.activeTextEditor;
    if (!activeTextEditor) {
      return;
    }
    const fileName = activeTextEditor.document.fileName;
    if (FileUtils.getExtension(fileName) !== 'java') {
      return;
    }
    const pairClass = this.getPairClass(fileName);
    if (!fs.existsSync(pairClass)) {
      vscode.window.showInformationMessage('not found pair class.' + pairClass);
      return;
    }
    VscodeUtils.showTextDocument(pairClass);
  }

  private makeTestClass(pairClass: string): string {
    const index = pairClass.lastIndexOf('/');
    const rootPath = vscode.workspace.rootPath;
    const packageName = pairClass.substring((rootPath + '/src/test/java/').length, index).replace(/\//g, '.');
    let packageSt: string = '';
    if (packageName.length !== 1) {
      packageSt = `package ${packageName};`;
    }
    const className = pairClass.substring(index + 1, pairClass.lastIndexOf('.'));
    return `
${packageSt}

import org.junit.Test;

public class ${className} {

  @Test
  public void test() {

  }
}`.trim();
  }

  /**
   * アクティブエディターのJavaクラスに対応するペアテストクラスファイルを作成します。
   */
  async newFileOfJavaTestClass(): Promise<void> {
    const activeTextEditor = vscode.window.activeTextEditor;
    if (!activeTextEditor) {
      return;
    }
    const fileName = activeTextEditor.document.fileName;
    if (FileUtils.getExtension(fileName) !== 'java') {
      return;
    }
    const pairClass = this.getPairClass(fileName);
    if (pairClass.lastIndexOf('Test.java') === -1) {
      return;
    }
    if (fs.existsSync(pairClass)) {
      vscode.window.showInformationMessage('exists pair class.');
      return;
    }
    const parentDir = FileUtils.getParent(pairClass);
    if (parentDir !== undefined && !fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }    
    fs.writeFileSync(pairClass, this.makeTestClass(pairClass));
    VscodeUtils.showTextDocument(pairClass);
  }
}