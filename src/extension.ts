import * as vscode from "vscode";
import { commands } from "./commands";

export function activate(context: vscode.ExtensionContext) {
  for (const command of commands) {
    context.subscriptions.push(command);
  }

  createStartStatusBarItem(context);
  createNextStatusBarItem(context);
  createMobStatusBarItem(context);

  vscode.commands.executeCommand("mob-vscode-gui.mobCommandExists");
}

export function deactivate() {}

function createStartStatusBarItem(context: vscode.ExtensionContext) {
  const item = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );

  item.command = "mob-vscode-gui.start";

  context.subscriptions.push(item);

  item.text = `$(debug-start) Mob Start`;
  item.tooltip = `Start you turn`;

  item.show();
}

function createNextStatusBarItem(context: vscode.ExtensionContext) {
  const item = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );

  item.command = "mob-vscode-gui.next";

  context.subscriptions.push(item);

  item.text = `$(debug-step-over) Mob Next`;
  item.tooltip = `Next turn`;
  item.show();
}

function createMobStatusBarItem(context: vscode.ExtensionContext) {
  const myCommandId = "mob-vscode-gui.mobUtilsClick";

  context.subscriptions.push(
    vscode.commands.registerCommand(myCommandId, async () => {
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
    })
  );

  const item = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );

  item.command = myCommandId;
  item.text = `$(menu) Mob Utils`;
  item.tooltip = `Menu`;
  item.show();

  context.subscriptions.push(item);
}
