import { MobStatusBarItem } from "./mob-status-bar-item";

export function mobStatusBarItemsFactory(): MobStatusBarItem[] {
  const mobStartItem = new MobStatusBarItem({
    id: "start",
    icon: "debug-start",
    name: "Mob Start",
    command: "mob-vscode-gui.start",
    tooltip: "Start you turn",
    priority: 3,
  });

  const mobNextItem = new MobStatusBarItem({
    id: "next",
    icon: "debug-step-over",
    name: "Mob Next",
    command: "mob-vscode-gui.next",
    tooltip: "Next turn",
    priority: 2,
  });

  const mobMenuItem = new MobStatusBarItem({
    id: "utils",
    icon: "menu",
    name: "Mob Utils",
    command: "mob-vscode-gui.mobUtilsClick",
    tooltip: "Menu",
    priority: 1,
  });

  return [mobStartItem, mobNextItem, mobMenuItem];
}
