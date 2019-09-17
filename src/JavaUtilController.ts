import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { FileUtils } from './FileUtils';
import { VscodeUtils } from './VscodeUtils';

export class JavaUtilController {

  constructor() {
  }

  private getPairClass(fileName: string): string {
    const index = fileName.lastIndexOf('.');
    if (!FileUtils.isJavaTestFile(fileName)) {
      return fileName.replace('/src/main/java', '/src/test/java').substring(0, index) + "Test.java";
    } else {
      return fileName.replace('/src/test/java', '/src/main/java').substring(0, index - 4) + ".java";
    }
  }

  async openPairClass(): Promise<void> {
    const activeTextEditor = vscode.window.activeTextEditor;
    if (!activeTextEditor) {
      return;
    }
    const fileName = activeTextEditor.document.fileName;
    if (!FileUtils.isJavaFile(fileName)) {
      return;
    }
    const pairClass = this.getPairClass(fileName);
    if (!FileUtils.existsSync(pairClass)) {
      vscode.window.showInformationMessage('not found pair class. ' + pairClass);
      return;
    }
    VscodeUtils.showTextDocument(pairClass);
  }

  private makeTestClass(pairClass: string): string {
    const index = pairClass.lastIndexOf('/');
    const packageName = pairClass.substring(pairClass.indexOf('/src/test/java/') + 15, index - 1).replace(/\//g, '.');
    const className = pairClass.substring(index + 1, pairClass.lastIndexOf('.'));
    return `
${packageName ? `package ${packageName};` : ''}

import org.junit.Test;

public class ${className} {

  @Test
  public void test() {

  }
}`.trim();
  }

  private makeCompilationUnit(type: string, canonicalPath: string): string | undefined {
    const indexes = ['/src/main/java/', '/src/test/java/', '/src/main/generated/']
      .filter(s => canonicalPath.lastIndexOf(s) !== -1)
      .map(s => canonicalPath.lastIndexOf(s) + s.length);
    if (!indexes) {
      return;
    }
    const packageName = path.dirname(canonicalPath).substring(indexes[0]).replace(/\//g, '.');
    const basename = path.basename(canonicalPath);
    const className = basename.substring(0, basename.lastIndexOf('.'));
    return `
${packageName ? `package ${packageName};` : ''}

public ${type} ${className} {

}
    `.trim();
  }

  /**
   * アクティブエディターのJavaクラスに対応するペアテストクラスファイルを作成します。
   */
  async newTestClass(): Promise<void> {
    const activeTextEditor = vscode.window.activeTextEditor;
    if (!activeTextEditor) {
      return;
    }
    const fileName = activeTextEditor.document.fileName;
    if (!FileUtils.isJavaFile(fileName)) {
      return;
    }
    const pairClass = this.getPairClass(fileName);
    if (!FileUtils.isJavaTestFile(pairClass)) {
      return;
    }
    if (FileUtils.existsSync(pairClass)) {
      vscode.window.showInformationMessage('exists pair class.');
      return;
    }
    const parentDir = FileUtils.getParent(pairClass);
    if (FileUtils.existsSync(parentDir)) {
      FileUtils.mkdirsSync(parentDir);
    }
    fs.writeFileSync(pairClass, this.makeTestClass(pairClass));
    VscodeUtils.showTextDocument(pairClass);
  }

  private getParent(selectedDir: string | undefined): string | undefined {
    if (selectedDir) {
      return selectedDir;
    } else {
      const activeTextEditor = vscode.window.activeTextEditor;
      if (!activeTextEditor) {
        return;
      }
      return path.dirname(activeTextEditor.document.fileName);
    }
  }

  async newPackage(selectedDir: any | undefined): Promise<void> {
    const packageName = await vscode.window.showInputBox({
      prompt: 'New Packages',
      placeHolder: 'Example: java.lang',
      ignoreFocusOut: true
    });
    if (!packageName) {
      return;
    }
    let rootDir = this.getParent(selectedDir.path);
    if (!rootDir) {
      return;
    }
    const packagePath = path.join(rootDir, packageName.replace(/\./g, '/'), '/');
    if (!FileUtils.existsSync(packagePath)) {
      FileUtils.mkdirsSync(packagePath);
    }
  }

  async newClass(selectedDir: any | undefined): Promise<void> {
    const className = await vscode.window.showInputBox({
      prompt: 'New Class',
      placeHolder: 'Example: Test',
      ignoreFocusOut: true
    });
    if (!className) {
      return;
    }
    let rootDir = this.getParent(selectedDir.path);
    if (!rootDir) {
      return;
    }
    const canonicalPath = path.join(rootDir, className.replace(/\./g, '/')) + '.java';
    if (fs.existsSync(canonicalPath)) {
      return;
    }
    const parentDir = path.dirname(canonicalPath);
    if (!fs.existsSync(parentDir)) {
      FileUtils.mkdirsSync(parentDir);
    }
    const doc = this.makeCompilationUnit('class', canonicalPath);
    if (!doc) {
      return;
    }
    fs.writeFileSync(canonicalPath, doc);
    await VscodeUtils.showTextDocument(canonicalPath);
  }
}