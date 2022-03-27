import { StatusBarAlignment, StatusBarItem, window } from "vscode";

interface Props {
  icon: string;
  name: string;
  command: string;
  tooltip: string;
}

export class MobStatusBarItem {
  private _statusBarItem: StatusBarItem;
  constructor(props: Props) {
    this._statusBarItem = window.createStatusBarItem(
      StatusBarAlignment.Left,
      100
    );

    this._statusBarItem.text = `$(${props.icon}) ${props.name}`;
    this._statusBarItem.tooltip = props.tooltip;
    this._statusBarItem.command = props.command;
    this._statusBarItem.show();
  }

  public startLoading() {
    this._statusBarItem.text = "LOADING";
  }

  public stopLoading() {
    this._statusBarItem.text = "FINISHED";
  }

  public dispose() {
    this._statusBarItem.dispose();
  }
}
