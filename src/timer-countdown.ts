import * as vscode from "vscode";

export class TimerCountdown {

  startTimer(minutes:number):void {

    this.startTimerMessage(minutes);

    let countDownDate = new Date();
    countDownDate = new Date(countDownDate.getTime() + minutes*60000);

    const interval = setInterval(function() {
      let now = new Date().getTime();
      let distance = countDownDate.getTime() - now;

      if (distance < 0) {
        clearInterval(interval);
        vscode.window.showWarningMessage("Your timer is over, please commit your work 🔥");
      }
    }, 1000);
  }

  private startTimerMessage(minutes:number):void {

    function padTo2Digits(num:number) {
      return String(num).padStart(2, '0');
    }

    const now = new Date();
    const end = new Date(now.getTime() + minutes*60000);

    const timeStartMinutes = padTo2Digits(now.getHours()) + ":" + padTo2Digits(now.getMinutes());
    const timeEndMinutes = padTo2Digits(end.getHours()) + ":" + padTo2Digits(end.getMinutes());

    vscode.window.showInformationMessage(`It's now ${timeStartMinutes}. ${minutes} min timer ends at approx.${timeEndMinutes}. Happy collaborating 🚀`);
  }
}
