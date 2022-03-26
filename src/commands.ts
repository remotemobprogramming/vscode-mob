import * as vscode from "vscode";
var commandExists = require("command-exists");

const terminal = vscode.window.createTerminal(`Mob Terminal`);

export const commands = [
  vscode.commands.registerCommand("mob-vscode-gui.mobCommandExists", () => {
    commandExists("mob", function (err: Error, commandExists: boolean) {
      if (!commandExists) {
        vscode.window.showErrorMessage(
          "Mob command not found. Please install Mob.sh: https://mob.sh"
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
  vscode.commands.registerCommand("mob-vscode-gui.reset", () => {
    const validInputs = {
      yes: ["y", "yes"],
      no: ["n", "no"],
    };

    const input = vscode.window.showInputBox({
      title:
        "Are you sure? This will delete your commits in the WIP branch (but preserves uncommitted work)",
      placeHolder: "yes(y) / no(n)",
      validateInput: (input) => {
        if (
          !validInputs.yes.includes(input.toLowerCase()) &&
          !validInputs.no.includes(input.toLowerCase())
        ) {
          return "Please enter yes(y) or no(n)";
        }

        return null;
      },
    });

    input.then((input) => {
      if (input && validInputs.yes.includes(input)) {
        terminal.sendText("mob reset");
      }
    });
  }),
];
