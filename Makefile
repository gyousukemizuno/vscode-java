clean:
	rm -r node_modules out

compile: clean
	npm install
	npm run compile

package: clean compile
	vsce package

install: package
	code --install-extension vscode-java-0.0.1.vsix
