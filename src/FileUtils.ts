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

  public static isJavaTestFile(fileName: string):boolean {
    return fileName.lastIndexOf("Test.java") !== -1;
  }

  public static getParent(fileName: string): string | undefined {
    const index = fileName.lastIndexOf('/');
    if (index === -1) {
      return undefined;
    }
    return fileName.substring(0, index);
  }
}