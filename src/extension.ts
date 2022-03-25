import * as vscode from "vscode";
import { MobViewProvider } from "./views/mob-view-provider";
var commandExists = require("command-exists");

vscode.window.createTreeView("mobUtils", {
  treeDataProvider: new MobViewProvider(),
});

export function activate(context: vscode.ExtensionContext) {
  const terminal = vscode.window.createTerminal(`Mob Terminal`);

  let commands = [
    vscode.commands.registerCommand("mob-vscode-gui.mobCommandExists", () => {
      commandExists("mob", function (err: Error, commandExists: boolean) {
        if (!commandExists) {
          vscode.window.showErrorMessage(
            "Mob command not found. Please install Mob.sh: https://mob.sh"
          );
        } else {
          vscode.window.showInformationMessage(
            "Mob command found! Please support the Mob.sh project: https://mob.sh/"
          );
        }
      });
    }),
    vscode.commands.registerCommand("mob-vscode-gui.start", () => {
      const timeInput = vscode.window.showInputBox({
        title: "How much time?",
        placeHolder: "Enter to ignore",
        validateInput: (input) => {
          if (input === "") {
            return null;
          }

          if (!/^\d+$/.test(input)) {
            return "Please enter a number";
          }

          if (Number(input) < 1) {
            return "Please enter a number greater than 0";
          }

          return null;
        },
      });

      timeInput.then((input) => {
        let command = "mob start";
        const timer = Number(input);

        if (timer > 0) {
          command += ` ${timer}`;
        }

        terminal.sendText(command);
      });
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
