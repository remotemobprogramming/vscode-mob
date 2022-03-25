// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { MobViewProvider } from "./views/mob-view-provider";

vscode.window.createTreeView("mobUtils", {
  treeDataProvider: new MobViewProvider(),
});

export function activate(context: vscode.ExtensionContext) {
  const terminal = vscode.window.createTerminal(`Ext Mob GUI terminal}`);

  let commands = [
    vscode.commands.registerCommand("mob-vscode-gui.start", () => {
      terminal.sendText("mob start");
    }),
    vscode.commands.registerCommand("mob-vscode-gui.next", () => {
      terminal.sendText("mob next");
    }),
    vscode.commands.registerCommand("mob-vscode-gui.done", () => {
      terminal.sendText("mob done");
    }),
  ];

  for (const command of commands) {
    context.subscriptions.push(command);
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}
