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
    if (FileUtils.isJavaFile(fileName)) {
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
    const packageName = pairClass.substring(pairClass.indexOf('/src/test/java/') + 15, index).replace(/\//g, '.');
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
    if (FileUtils.isJavaFile(fileName)) {
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

  newPackageDirectory(selectedDir: any | undefined): void {
    vscode.window.showInputBox({
      prompt: 'New Packages',
      placeHolder: 'Example: java.lang',
      ignoreFocusOut: true
    }).then((packageName: string | undefined) => {
      if (!packageName) {
        return;
      }
      let rootDir: string = '';
      if (selectedDir) {
        rootDir = selectedDir.path;
      } else {
        const activeTextEditor = vscode.window.activeTextEditor;
        if (!activeTextEditor) {
          return;
        }
        rootDir = path.dirname(activeTextEditor.document.fileName);
      }
      const packagePath = path.join(rootDir, packageName.replace(/\./g, '/'), '/');
      console.log(packagePath);
      if (!FileUtils.existsSync(packagePath)) {
        FileUtils.mkdirsSync(packagePath);
      }
    });
  }
}