import { ExecException } from "child_process";
import * as vscode from "vscode";

export function commandErrorHandler(data: {
  expectedMessage: string[];
  stdout: string;
}) {
  const { expectedMessage, stdout } = data;

  for (const message of expectedMessage) {
    if (!stdout.includes(message)) {
      vscode.window.showWarningMessage(stdout);
      return;
    }
  }
}
