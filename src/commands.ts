import * as childProcess from "child_process";
import { ExecException } from "child_process";
import * as vscode from "vscode";
import { commandErrorHandler } from "./command-error-handler";
import { timerInputValidator } from "./validators/time-input-validator";
var commandExists = require("command-exists");

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
      validateInput: (input) => timerInputValidator(input),
    });

    timeInput.then((input) => {
      let command = "mob start --include-uncommitted-changes";
      const timer = Number(input);

      if (timer > 0) {
        command += ` ${timer}`;
      }

      const expectedMessage = ["Happy collaborating!"];
      exec(command, expectedMessage);
    });
  }),
  vscode.commands.registerCommand("mob-vscode-gui.next", () => {
    const command = "mob next";
    const expectedMessage = ["git push --no-verify"];
    exec(command, expectedMessage);
  }),
  vscode.commands.registerCommand("mob-vscode-gui.done", () => {
    const command = "mob done";
    const expectedMessage = ["To finish, use"];
    exec(command, expectedMessage);
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
        const command = "mob reset";
        const expectedMessage = ["Branches", "deleted"];
        exec(command, expectedMessage);
      }
    });
  }),
  vscode.commands.registerCommand("mob-vscode-gui.timer", () => {
    const timeInput = vscode.window.showInputBox({
      title: "How much time?",
      placeHolder: "Enter to ignore",
      validateInput: (input) => timerInputValidator(input),
    });

    timeInput.then((input) => {
      let command = "mob timer";
      const timer = Number(input);

      if (timer > 0) {
        command += ` ${timer}`;
      }

      const expectedMessage = ["Happy collaborating!"];
      exec(command, expectedMessage);
    });
  }),
];

function exec(command: string, expectedMessage: string[]) {
  if (vscode.workspace.workspaceFolders?.length !== 1) {
    vscode.window.showWarningMessage(
      `1 workspace folder required. Found ${Number(
        vscode.workspace.workspaceFolders?.length
      )}`
    );
    return;
  }

  const cwd = vscode.workspace.workspaceFolders[0].uri.fsPath;
  childProcess.exec(
    command,
    { cwd },
    (error: ExecException | null, stdout: string, stderr: string) => {
      commandErrorHandler({ expectedMessage, error, stdout, stderr });
    }
  );
}
