import * as vscode from 'vscode';

// 查找包含特定代码的行并设置断点
async function findAndSetBreakpoints(includePattern: string, excludePattern: string, searchString: string, progress: vscode.Progress<{ message?: string, increment?: number }>) {
	const files = await vscode.workspace.findFiles(includePattern, excludePattern);

	const totalFiles = files.length;
	const processIncrementSize = 1 / (totalFiles || 1) * 100;

	await Promise.all(files.map(async (file) => {
			try {
					const document = await vscode.workspace.openTextDocument(file);
					const text = document.getText();
					const regex = new RegExp(searchString, 'g');
					let match: RegExpExecArray | null;
					const breakpoints: vscode.SourceBreakpoint[] = [];

					while ((match = regex.exec(text)) !== null) {
							const line = document.positionAt(match.index).line;
							const position = new vscode.Position(line, 0);
							const uri = document.uri;
							const breakpoint = new vscode.SourceBreakpoint(new vscode.Location(uri, position));
							breakpoints.push(breakpoint);
					}

					vscode.debug.addBreakpoints(breakpoints);
					if (breakpoints.length > 0) {
							vscode.window.showInformationMessage(`Breakpoints set in ${file.fsPath}`);
					}

					 // @ts-ignore
					 progress.report({ increment: processIncrementSize });
			} catch (error) {
					console.error(`Error processing file ${file.fsPath}:`, error);
			}
	}));

	// 确保进度条显示完成
	progress.report({ increment: 100 });
}


// 注册设置断点的命令
export const setBreakpointsCommand = vscode.commands.registerCommand('extension.setBreakpointsInFiles', async () => {
	const includePattern = vscode.workspace.getConfiguration().get<string>('breakpointSetter.filesToInclude') || '**/*';
	const excludePattern = vscode.workspace.getConfiguration().get<string>('breakpointSetter.filesToExclude') || '';

	if (!includePattern) {
			vscode.window.showErrorMessage('No directory configured! Please set "breakpointSetter.filesToInclude" in settings.');
			return;
	}

	const searchString = await vscode.window.showInputBox({
			prompt: 'Enter the specific code to search for breakpoints',
			validateInput: (value) => value.trim() === '' ? 'Search string cannot be empty' : null
	});

	if (!searchString) {
			return;
	}

	// 使用进度条显示查找和设置断点的进度
	await vscode.window.withProgress({
			title: 'Setting Breakpoints',
			location: vscode.ProgressLocation.Notification, // 或使用 vscode.ProgressLocation.Window
			cancellable: false
	}, async (progress) => {
			await findAndSetBreakpoints(includePattern, excludePattern, searchString, progress);
	});
});