import * as vscode from "vscode";
import { commands } from "./commands";
import { mobStatusBarItemsFactory } from "./status-bar-items/mob-status-bar-items-factory";

export function activate(context: vscode.ExtensionContext) {
  for (const command of commands) {
    context.subscriptions.push(command);
  }

  const statusBarItems = mobStatusBarItemsFactory();
  for (const statusBarItem of statusBarItems) {
    context.subscriptions.push(statusBarItem.item);
  }

  vscode.commands.executeCommand("mob-vscode-gui.mobCommandExists");
}

export function deactivate() {}
