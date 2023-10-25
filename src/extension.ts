import * as vscode from "vscode";
import { commandFactory } from "./commands";
import { mobStatusBarItemsFactory } from "./status-bar-items/mob-status-bar-items-factory";

export function activate(context: vscode.ExtensionContext) {
  const statusBarItems = mobStatusBarItemsFactory();
  for (const statusBarItem of statusBarItems) {
    context.subscriptions.push(statusBarItem);
  }

  const commands = commandFactory(statusBarItems);
  for (const command of commands) {
    context.subscriptions.push(command);
  }

  vscode.commands.executeCommand("mob-vscode-gui.mobCommandExists");
}

export function deactivate() {}
