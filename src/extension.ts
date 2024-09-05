import * as vscode from 'vscode';

// 激活插件
export function activate(context: vscode.ExtensionContext) {
    // 注册设置断点的命令
    const setBreakpointsCommand = vscode.commands.registerCommand('extension.setBreakpointsInFiles', async () => {
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

    // 注册移除所有断点的命令
    const removeAllBreakpointsCommand = vscode.commands.registerCommand('extension.removeAllBreakpoints', () => {
        const breakpoints = vscode.debug.breakpoints;
        if (breakpoints.length === 0) {
            vscode.window.showInformationMessage('No breakpoints to remove.');
            return;
        }
        vscode.debug.removeBreakpoints(breakpoints);
        vscode.window.showInformationMessage('All breakpoints removed.');
    });

    // 注册根据搜索关键词移除断点的命令
    const removeBreakpointsByKeywordCommand = vscode.commands.registerCommand('extension.removeBreakpointsByKeyword', async () => {
        const searchString = await vscode.window.showInputBox({
            prompt: 'Enter the specific code to remove breakpoints',
            validateInput: (value) => value.trim() === '' ? 'Search string cannot be empty' : null
        });

        if (!searchString) {
            return;
        }

        await findAndRemoveBreakpoints(searchString);
    });

    context.subscriptions.push(setBreakpointsCommand, removeAllBreakpointsCommand, removeBreakpointsByKeywordCommand);
}

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

// 根据搜索关键词查找并移除断点
async function findAndRemoveBreakpoints(searchString: string) {
    const breakpoints = vscode.debug.breakpoints as vscode.SourceBreakpoint[];
    let removedCount = 0;

    // 获取所有打开的文档
    const documents = await vscode.workspace.findFiles('**/*', '');
    const fileMap = new Map<string, vscode.TextDocument>();

    // 将每个打开的文档缓存到文件映射中
    await Promise.all(documents.map(async (file) => {
        try {
            const document = await vscode.workspace.openTextDocument(file);
            fileMap.set(file.fsPath, document);
        } catch (error) {
            console.error(`Error opening file ${file.fsPath}:`, error);
        }
    }));

    // 遍历所有断点并尝试移除符合条件的断点
    await Promise.all(breakpoints.map(async (breakpoint) => {
        const uri = breakpoint.location.uri.fsPath;
        const line = breakpoint.location.range.start.line;

        // 查找文件中匹配的行
        const document = fileMap.get(uri);
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

// 禁用插件
export function deactivate() {}
