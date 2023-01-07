import { exec, ExecException } from "child_process";
import * as vscode from "vscode";
import { commandErrorHandler } from "./command-error-handler";
import { MobStatusBarItem } from "./status-bar-items/mob-status-bar-item";
import { TimerCountdown } from "./timer-countdown";
import { timerInputValidator } from "./validators/time-input-validator";
var commandExists = require("command-exists");

export function commandFactory(statusBarItems: MobStatusBarItem[]) {
  return [
    vscode.commands.registerCommand("mob-vscode-gui.mobCommandExists", () => {
      commandExists("mob", function (err: Error, commandExists: boolean) {
        if (!commandExists) {
          vscode.window.showErrorMessage(
            "Mob command not found. Please install mob.sh: https://mob.sh"
          );
        }
      });
    }),
    vscode.commands.registerCommand("mob-vscode-gui.start", async () => {
      const timeInput = await vscode.window.showInputBox({
        title: "How many minutes?",
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

        if (timer > 0) {
          const timerCountdown = new TimerCountdown();
          timerCountdown.startTimer(timer);
        }
      } finally {
        startItem?.stopLoading();

        if (timer > 0) {
          startItem?.startCountDown(timer);
        }
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

        const startItem = statusBarItems.find((item) => item.id === "start");
        startItem?.stopLoading();
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

        const startItem = statusBarItems.find((item) => item.id === "start");
        startItem?.stopLoading();
      }
    }),
    vscode.commands.registerCommand("mob-vscode-gui.timer", () => {
      const timeInput = vscode.window.showInputBox({
        title: "How many minutes?",
        placeHolder: "Enter to ignore",
        validateInput: (input) => timerInputValidator(input),
      });

      timeInput.then((input) => {
        let command = "mob timer";
        const timer = Number(input);

        if (timer > 0) {
          command += ` ${timer}`;

          const startItem = statusBarItems.find((item) => item.id === "start");
          startItem?.startCountDown(timer);
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
  if(vscode.workspace.workspaceFolders?.length !== undefined) {
    let workspace: string | undefined = vscode.workspace.workspaceFolders[0].uri.fsPath;
    
    if(vscode.workspace.workspaceFolders.length > 1) {
      const allFoldersName = vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath);
      workspace = await vscode.window.showQuickPick(allFoldersName, {
        title: 'Choose a workspace'
      }); 
    } 

    return new Promise((resolve, reject) => {
      exec(
        command,
        { cwd: workspace },
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

  vscode.window.showWarningMessage(
    'At least one workspace folder is required'
  );
  return;
}
