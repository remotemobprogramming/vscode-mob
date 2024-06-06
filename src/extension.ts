import * as vscode from "vscode";
import { commandFactory } from "./commands";
import { mobStatusBarItemsFactory } from "./status-bar-items/mob-status-bar-items-factory";

export function activate(context: vscode.ExtensionContext) {
  const statusBarItems = mobStatusBarItemsFactory();
  for (const statusBarItem of statusBarItems) {
    context.subscriptions.push(statusBarItem);
  }

  const mobExecutionCommand = vscode.workspace.getConfiguration().get<string>('mob-vscode-gui.mobExecutionCommand', 'mob');
  const commands = commandFactory(mobExecutionCommand, statusBarItems);
  for (const command of commands) {
    context.subscriptions.push(command);
  }

  vscode.commands.executeCommand("mob-vscode-gui.mobCommandExists");
}

export function deactivate() {}
