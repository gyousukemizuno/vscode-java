// SPDX-License-Identifier: GPL-2.0
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { FileUtils } from './FileUtils';
import { VscodeUtils } from './VscodeUtils';

export class JavaTools {

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
      const ans = await vscode.window.showInputBox({
        prompt: "New Pair Class?",
        placeHolder: "Yes",
        ignoreFocusOut: true
      });
      if (!ans) {
        return;
      }
      this.newTestClass();
      return;
    }
    VscodeUtils.showTextDocument(pairClass);
  }

  private makeTestClass(pairClass: string): string {
    const index = pairClass.lastIndexOf('/');    
    const packageName = path.normalize(pairClass).substring(pairClass.indexOf('/src/test/java/') + 15, index).replace(/\//g, '.');
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
      VscodeUtils.showTextDocument(pairClass);
      return;
    }
    const parentDir = FileUtils.getParent(pairClass);
    if (!FileUtils.existsSync(parentDir)) {
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

  private capitaize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  async newClass(selectedDir: any | undefined): Promise<void> {
    return this.newCompilationUnit(selectedDir, 'class', 'New Class', 'Example: Test');
  }

  async newInterface(selectedDir: any | undefined): Promise<void> {
    return this.newCompilationUnit(selectedDir, 'interface', 'New Interface', 'Example: Test');
  }

  async newEnum(selectedDir: any | undefined): Promise<void> {
    return this.newCompilationUnit(selectedDir, 'enum', 'New Enum', 'Example: Test');
  }

  async newCompilationUnit(selectedDir: any | undefined, type: string, prompt: string, placeHolder: string): Promise<void> {
    let className = await vscode.window.showInputBox({
      prompt: prompt,
      placeHolder: placeHolder,
      ignoreFocusOut: true
    });
    if (!className) {
      return;
    }
    className = this.capitaize(className);
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
    const doc = this.makeCompilationUnit(type, canonicalPath);
    if (!doc) {
      return;
    }
    fs.writeFileSync(canonicalPath, doc);
    VscodeUtils.showTextDocument(canonicalPath);
  }
}