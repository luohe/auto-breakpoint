import * as vscode from 'vscode';

// 注册移除所有断点的命令
export const removeAllBreakpoints = vscode.commands.registerCommand('extension.removeAllBreakpoints', () => {
	const breakpoints = vscode.debug.breakpoints;
	if (breakpoints.length === 0) {
			vscode.window.showInformationMessage('No breakpoints to remove.');
			return;
	}
	vscode.debug.removeBreakpoints(breakpoints);
	vscode.window.showInformationMessage('All breakpoints removed.');
});