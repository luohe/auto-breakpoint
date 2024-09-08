import * as vscode from 'vscode';

// 根据搜索关键词查找并移除断点
async function findAndRemoveBreakpoints(searchString: string) {
	const breakpoints = vscode.debug.breakpoints as vscode.SourceBreakpoint[];
	let removedCount = 0;

	// 遍历所有断点并尝试移除符合条件的断点
	await Promise.all(breakpoints.map(async (breakpoint) => {
			const uri = breakpoint.location.uri.fsPath;
			const line = breakpoint.location.range.start.line;

			// 查找文件中匹配的行
			const document = await vscode.workspace.openTextDocument(uri);
			if (document) {
					const text = document.getText();
					const regex = new RegExp(searchString, 'g');
					let match: RegExpExecArray | null;

					while ((match = regex.exec(text)) !== null) {
							const matchedLine = document.positionAt(match.index).line;
							if (matchedLine === line) {
									vscode.debug.removeBreakpoints([breakpoint]);
									removedCount++;
									break;
							}
					}
			}
	}));

	if (removedCount > 0) {
			vscode.window.showInformationMessage(`Removed ${removedCount} breakpoints.`);
	} else {
			vscode.window.showInformationMessage('No breakpoints found to remove.');
	}
}


export const removeBreakpointsByKeyword = vscode.commands.registerCommand('extension.removeBreakpointsByKeyword', async () => {
	const searchString = await vscode.window.showInputBox({
			prompt: 'Enter the specific code to remove breakpoints',
			validateInput: (value) => value.trim() === '' ? 'Search string cannot be empty' : null
	});

	if (!searchString) {
			return;
	}

	await findAndRemoveBreakpoints(searchString);
});