import * as vscode from 'vscode';

import { setBreakpointsCommand, removeAllBreakpoints, removeBreakpointsByKeyword } from './command';

// 激活插件
export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(setBreakpointsCommand, removeAllBreakpoints, removeBreakpointsByKeyword);
}

// 禁用插件
export function deactivate() {}
