import * as vscode from "vscode";
var commandExists = require("command-exists");

export function activate(context: vscode.ExtensionContext) {
  createStartStatusBarItem(context);
  createNextStatusBarItem(context);
  createMobStatusBarItem(context);

  createCommands(context);

  vscode.commands.executeCommand("mob-vscode-gui.mobCommandExists");
}

export function deactivate() {}

function createCommands(context: vscode.ExtensionContext) {
  const terminal = vscode.window.createTerminal(`Mob Terminal`);

  let commands = [
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
  ];

  for (const command of commands) {
    context.subscriptions.push(command);
  }
}

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
  item.tooltip = `Done mob session`;
  item.show();

  context.subscriptions.push(item);
}
