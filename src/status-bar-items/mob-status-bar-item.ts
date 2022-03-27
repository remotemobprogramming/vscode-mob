import { StatusBarAlignment, StatusBarItem, window } from "vscode";

interface Props {
  id: string;
  icon: string;
  name: string;
  command: string;
  tooltip: string;
  priority: number;
}

export class MobStatusBarItem {
  private _statusBarItem: StatusBarItem;

  constructor(private readonly _props: Props) {
    this._statusBarItem = window.createStatusBarItem(
      this._props.id,
      StatusBarAlignment.Left,
      _props.priority
    );

    this._statusBarItem.text = `$(${this._props.icon}) ${this._props.name}`;
    this._statusBarItem.tooltip = this._props.tooltip;
    this._statusBarItem.command = this._props.command;
    this._statusBarItem.show();
  }

  get id() {
    return this._props.id;
  }

  public startLoading(customText?: string) {
    this._statusBarItem.text = `$(loading~spin) ${
      customText ?? this._props.name
    }`;
    this._statusBarItem.show();
  }

  public stopLoading() {
    this._statusBarItem.text = `$(${this._props.icon}) ${this._props.name}`;
    this._statusBarItem.show();
  }

  public dispose() {
    this._statusBarItem.dispose();
  }
}
