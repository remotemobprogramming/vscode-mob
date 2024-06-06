import * as vscode from "vscode";
import { commandErrorHandler } from "./command-error-handler";
import { MobStatusBarItem } from "./status-bar-items/mob-status-bar-item";
import { TimerCountdown } from "./timer-countdown";
import { timerInputValidator } from "./validators/time-input-validator";
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
var commandExists = require("command-exists");

let GLOBAL_WORKSPACE = "";

export function commandFactory(mobExecutionCommand: string, statusBarItems: MobStatusBarItem[]) {
  const timerCountdown = new TimerCountdown();

  return [
    vscode.commands.registerCommand("mob-vscode-gui.mobCommandExists", () => {
      commandExists(mobExecutionCommand, function (err: Error, commandExists: boolean) {
        if (!commandExists) {
          vscode.window.showErrorMessage(
            "Mob command not found. Please install mob.sh: https://mob.sh or change the mobExecutionCommand setting."
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

      let command = mobExecutionCommand + " start --include-uncommitted-changes";
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
        await runCommand(command, expectedMessage);

        if (timer > 0) {
          timerCountdown.startTimer(timer);
        }
      } finally {
        startItem?.stopLoading();
        timerCountdown.stopTimer();

        if (timer > 0) {
          startItem?.startCountDown(timer);
        }
      }
    }),
    vscode.commands.registerCommand("mob-vscode-gui.next", async () => {
      const nextItem = statusBarItems.find((item) => item.id === "next");
      nextItem?.startLoading();

      try {
        const mobRequireCommitMessage = await getConfig('MOB_REQUIRE_COMMIT_MESSAGE', mobExecutionCommand) === 'true';

        let commitMessageInput: string | undefined;
        if (mobRequireCommitMessage) {
          commitMessageInput = await vscode.window.showInputBox({
            title: "Please enter the commit message:",
            placeHolder: "Enter to ignore",
          });
        }

        let command = mobExecutionCommand + " next";
        if (commitMessageInput) {
          command = mobExecutionCommand + ` next -m '${commitMessageInput}'`;
        }
        const expectedMessage = ["git push --no-verify"];

        await runCommand(command, expectedMessage);
      } finally {
        nextItem?.stopLoading();

        const startItem = statusBarItems.find((item) => item.id === "start");
        startItem?.stopLoading();
        timerCountdown.stopTimer();
      }
    }),
    vscode.commands.registerCommand("mob-vscode-gui.done", async () => {
      const command = mobExecutionCommand + " done";
      const expectedMessage = ["To finish, use"];

      const utilsItem = statusBarItems.find((item) => item.id === "utils");
      utilsItem?.startLoading("Finishing session...");

      try {
        await runCommand(command, expectedMessage);
      } finally {
        utilsItem?.stopLoading();

        const startItem = statusBarItems.find((item) => item.id === "start");
        startItem?.stopLoading();
        timerCountdown.stopTimer();
      }
    }),
    vscode.commands.registerCommand("mob-vscode-gui.timer", () => {
      const timeInput = vscode.window.showInputBox({
        title: "How many minutes?",
        placeHolder: "Enter to ignore",
        validateInput: (input) => timerInputValidator(input),
      });

      timeInput.then((input) => {
        let command = mobExecutionCommand + " timer";
        const timer = Number(input);

        if (timer > 0) {
          command += ` ${timer}`;

          const startItem = statusBarItems.find((item) => item.id === "start");
          startItem?.startCountDown(timer);
        }

        const expectedMessage = ["Happy collaborating!"];
        runCommand(command, expectedMessage);
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

async function setWorkspace(
  vsCodeWorkspaceFolders: readonly vscode.WorkspaceFolder[]
): Promise<void> {
  let workspace = vsCodeWorkspaceFolders[0].uri.fsPath;

  if (vsCodeWorkspaceFolders.length > 1) {
    const allFoldersName = vsCodeWorkspaceFolders?.map(
      (folder) => folder.uri.fsPath
    );
    workspace = (await vscode.window.showQuickPick(allFoldersName, {
      title: "Choose a workspace",
    })) as string;
  }

  GLOBAL_WORKSPACE = workspace;
}

async function runCommand(
  command: string,
  expectedMessage: string[]
): Promise<string | null> {
  if (vscode.workspace.workspaceFolders?.length !== undefined) {
    await setWorkspace(vscode.workspace.workspaceFolders);

    try {
      const result = await exec(command, { cwd: GLOBAL_WORKSPACE });
      commandErrorHandler({ expectedMessage, stdout: result.stdout });
      return result.stdout;
    } catch (error: any) {
      console.error(error.message);

      vscode.window.showWarningMessage(`${error?.message}  ${error?.stderr} ${error?.stdout}`);

      throw error;
    }
  }

  vscode.window.showWarningMessage("At least one workspace folder is required");
  return null;
}

async function getConfig(configName: string, mobExecutionCommand: string): Promise<string | null> {
  const result = await runCommand(mobExecutionCommand + ' config', []);
  const configLine = result?.split("\n").find((config) => config.includes(configName));

  if (configLine) {
    const cutIndex = configLine.indexOf('=') + 1;
    return configLine.slice(cutIndex);
  }

  return null;
}
