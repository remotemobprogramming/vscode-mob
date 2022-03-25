// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { MobViewProvider } from "./views/mob-view-provider";
const cp = require("child_process");

vscode.window.createTreeView("mobUtils", {
  treeDataProvider: new MobViewProvider(),
});

export function activate(context: vscode.ExtensionContext) {
  const terminal = vscode.window.createTerminal(`Ext Mob GUI terminal}`);

  let commands = [
    vscode.commands.registerCommand("mob-vscode-gui.mobCommandExists", () => {
      cp.exec(
        'command -v mob >/dev/null && echo "found" || echo "not found"',
        (err: string, stdout: string, stderr: string) => {
          if (stdout !== "found") {
            vscode.window.showErrorMessage(
              "Mob command not found. Please install Mob CLI: https://mob.sh"
            );
          }
        }
      );
    }),
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

  vscode.commands.executeCommand("mob-vscode-gui.mobCommandExists");
}

// this method is called when your extension is deactivated
export function deactivate() {}
