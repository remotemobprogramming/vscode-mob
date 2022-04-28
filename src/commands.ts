import { exec, ExecException } from "child_process";
import * as vscode from "vscode";
import { commandErrorHandler } from "./command-error-handler";
import { MobStatusBarItem } from "./status-bar-items/mob-status-bar-item";
import { timerInputValidator } from "./validators/time-input-validator";
var commandExists = require("command-exists");

export function commandFactory(statusBarItems: MobStatusBarItem[]) {
  return [
    vscode.commands.registerCommand("mob-vscode-gui.mobCommandExists", () => {
      commandExists("mob", function (err: Error, commandExists: boolean) {
        if (!commandExists) {
          vscode.window.showErrorMessage(
            "Mob command not found. Please install Mob.sh: https://mob.sh"
          );
        }
      });
    }),
    vscode.commands.registerCommand("mob-vscode-gui.start", async () => {
      const timeInput = await vscode.window.showInputBox({
        title: "How much time?",
        placeHolder: "Enter to ignore",
        validateInput: (input) => timerInputValidator(input),
      });

      const branchName = await vscode.window.showInputBox({
        title: "Branch name:",
        placeHolder: "Enter to ignore",
      });

      let command = "mob start --include-uncommitted-changes";
      const expectedMessage = ["Happy collaborating!"];
      const timer = Number(timeInput);

      if (timer > 0) {
        command += ` ${timer}`;
      }

      if (branchName) {
        command += ` -b ${branchName}`;
      }

      const startItem = statusBarItems.find((item) => item.id === "start");
      startItem?.startLoading();

      try {
        await asyncExec(command, expectedMessage);
      } finally {
        startItem?.stopLoading();
      }
    }),
    vscode.commands.registerCommand("mob-vscode-gui.next", async () => {
      const command = "mob next";
      const expectedMessage = ["git push --no-verify"];

      const nextItem = statusBarItems.find((item) => item.id === "next");
      nextItem?.startLoading();

      try {
        await asyncExec(command, expectedMessage);
      } finally {
        nextItem?.stopLoading();
      }
    }),
    vscode.commands.registerCommand("mob-vscode-gui.done", async () => {
      const command = "mob done";
      const expectedMessage = ["To finish, use"];

      const utilsItem = statusBarItems.find((item) => item.id === "utils");
      utilsItem?.startLoading("Finishing session...");

      try {
        await asyncExec(command, expectedMessage);
      } finally {
        utilsItem?.stopLoading();
      }
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

      input.then(async (input) => {
        if (input && validInputs.yes.includes(input)) {
          const command = "mob reset";
          const expectedMessage = ["Branches", "deleted"];

          const utilsItem = statusBarItems.find((item) => item.id === "utils");
          utilsItem?.startLoading("Reseting session...");
          try {
            await asyncExec(command, expectedMessage);
          } finally {
            utilsItem?.stopLoading();
          }
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
        asyncExec(command, expectedMessage);
      });
    }),

    vscode.commands.registerCommand(
      "mob-vscode-gui.mobUtilsClick",
      async () => {
        await vscode.window
          .showQuickPick([
            {
              label: "Done",
              description: "Commit mob session",
              command: "mob-vscode-gui.done",
            },
            {
              label: "Reset",
              description: "Delete local and remote WIP branch",
              command: "mob-vscode-gui.reset",
            },
            {
              label: "Timer",
              description: "Set timer (in minutes)",
              command: "mob-vscode-gui.timer",
            },
          ])
          .then((option) => {
            if (option) {
              vscode.commands.executeCommand(option.command);
            }
          });
      }
    ),
  ];
}

async function asyncExec(
  command: string,
  expectedMessage: string[]
): Promise<void> {
  if (vscode.workspace.workspaceFolders?.length !== 1) {
    vscode.window.showWarningMessage(
      `1 workspace folder required. Found ${Number(
        vscode.workspace.workspaceFolders?.length
      )}`
    );
    return;
  }

  const cwd = vscode.workspace.workspaceFolders[0].uri.fsPath;

  return new Promise((resolve, reject) => {
    exec(
      command,
      { cwd },
      (error: ExecException | null, stdout: string, stderr: string) => {
        commandErrorHandler({ expectedMessage, error, stdout, stderr });
        if (error) {
          reject(error);
          return;
        }
        resolve();
      }
    );
  });
}
