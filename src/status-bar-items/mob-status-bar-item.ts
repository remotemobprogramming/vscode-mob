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
  private _lastSetInterval: NodeJS.Timeout | null = null;

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
    if(this._lastSetInterval !== null) {
      clearInterval(this._lastSetInterval);
      this._lastSetInterval = null;
    }

    this._statusBarItem.text = `$(${this._props.icon}) ${this._props.name}`;
    this._statusBarItem.show();
  }

  public startCountDown(minutes: number) {
    const self = this;
    let seconds = minutes * 60;

    if(this._lastSetInterval !== null) {
      clearInterval(this._lastSetInterval);
      this._lastSetInterval = null;
    }

    this._lastSetInterval = setInterval(function () {
        var date = new Date(0);
        date.setSeconds(seconds); 
        var timeString = date.toISOString().substring(11, 19);

        self._statusBarItem.text = `${timeString}`;

        if (--seconds < 0) {
            return;
        }
    }, 1000);
  }

  public dispose() {
    this._statusBarItem.dispose();
  }
}
