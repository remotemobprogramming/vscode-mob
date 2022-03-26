import { ExecException } from "child_process";
import * as vscode from "vscode";

export function commandErrorHandler(data: {
  expectedMessage: string[];
  error: ExecException | null;
  stdout: string;
  stderr: string;
}) {
  const { expectedMessage, error, stdout, stderr } = data;
  console.debug(stdout);
  if (error) {
    vscode.window.showWarningMessage(`${error.message}: ${stdout}`);
    return;
  }

  if (stderr) {
    vscode.window.showWarningMessage(`${stderr}: ${stdout}`);
    return;
  }

  for (const message of expectedMessage) {
    if (!stdout.includes(message)) {
      vscode.window.showWarningMessage(stdout);
      return;
    }
  }
}
