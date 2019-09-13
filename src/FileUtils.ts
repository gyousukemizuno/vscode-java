import * as path from 'path';
import * as fs from 'fs';

export class FileUtils {

  public static getExtension(fileName: string): string | undefined {
    const index = fileName.lastIndexOf('.');
    if (index === -1) {
      return undefined;
    }
    return fileName.substring(index + 1);
  }

  public static isJavaFile(fileName: string): boolean {
    return this.getExtension(fileName) === 'java';
  }

  public static isJavaTestFile(fileName: string): boolean {
    return fileName.lastIndexOf("Test.java") !== -1;
  }

  public static getParent(fileName: string): string | undefined {
    const index = fileName.lastIndexOf('/');
    if (index === -1) {
      return undefined;
    }
    return fileName.substring(0, index);
  }

  public static mkdirsSync(dirname: string | undefined): void {
    if (dirname === undefined) {
      return;
    }
    let dir = '/';
    path.normalize(dirname).split('/').forEach((basename) => {
      dir = path.join(dir, basename);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
    });
  }

  public static existsSync(fileName: string | undefined): boolean {
    return fileName !== undefined && fs.existsSync(fileName);
  }
}