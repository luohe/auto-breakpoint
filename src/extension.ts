import * as vscode from 'vscode';
import * as fs from 'fs/promises';

// 激活插件
export function activate(context: vscode.ExtensionContext) {
    // 注册命令
    const disposable = vscode.commands.registerCommand('extension.setBreakpointsInFiles', async () => {
        // 读取用户配置的目录路径
        const includePattern = vscode.workspace.getConfiguration().get<string>('breakpointSetter.filesToInclude') || '**/*';
        const excludePattern = vscode.workspace.getConfiguration().get<string>('breakpointSetter.filesToExclude') || '';

        if (!includePattern) {
            vscode.window.showErrorMessage('No directory configured! Please set "breakpointSetter.directory" in settings.');
            return;
        }

        // 获取用户输入的特定代码
        const searchString = await vscode.window.showInputBox({
            prompt: 'Enter the specific code to search for breakpoints',
            validateInput: (value) => value.trim() === '' ? 'Search string cannot be empty' : null
        });

        if (!searchString) {
            return;
        }

        // 查找包含特定代码的行并设置断点
        findAndSetBreakpoints(includePattern, excludePattern, searchString);
    });

    context.subscriptions.push(disposable);
}

// 查找包含特定代码的行并设置断点
async function findAndSetBreakpoints(includePattern: string, excludePattern: string, searchString: string) {
    // const relativePattern = new vscode.RelativePattern(includePattern);

    // 使用 workspace.findFiles 查找符合条件的文件
    const files = await vscode.workspace.findFiles(includePattern, excludePattern);
		let count = 0;
		// 异步并发处理文件
    await Promise.all(files.map(async (file) => {
			try {
					const document = await vscode.workspace.openTextDocument(file);
					const text = document.getText();

					// 使用正则表达式查找匹配的行
					const regex = new RegExp(searchString, 'g');
					let match: RegExpExecArray | null;
					const breakpoints: vscode.SourceBreakpoint[] = [];

					while ((match = regex.exec(text)) !== null) {
							const line = document.positionAt(match.index).line;
							const position = new vscode.Position(line, 0);
							const uri = document.uri;

							// 设置断点
							const breakpoint = new vscode.SourceBreakpoint(new vscode.Location(uri, position));
							breakpoints.push(breakpoint);
					}

					vscode.debug.addBreakpoints(breakpoints);
					if (breakpoints.length > 0) {
							vscode.window.showInformationMessage(`Breakpoints set in ${file.fsPath}`);
					}
					console.log(count++, '/', files.length);
			} catch (error) {
					console.error(`Error processing file ${file.fsPath}:`, error);
			}
	}));
}

// 禁用插件
export function deactivate() {}
