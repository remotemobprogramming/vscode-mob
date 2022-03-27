import { MobStatusBarItem } from "./mob-status-bar-item";

export function mobStatusBarItemsFactory(): {
  name: string;
  item: MobStatusBarItem;
}[] {
  const mobStartItem = new MobStatusBarItem({
    icon: "debug-start",
    name: "Mob Start",
    command: "mob-vscode-gui.start",
    tooltip: "Start you turn",
  });

  const mobNextItem = new MobStatusBarItem({
    icon: "debug-step-over",
    name: "Mob Next",
    command: "mob-vscode-gui.next",
    tooltip: "Next turn",
  });

  const mobMenuItem = new MobStatusBarItem({
    icon: "menu",
    name: "Mob Utils",
    command: "mob-vscode-gui.mobUtilsClick",
    tooltip: "Menu",
  });

  return [
    {
      name: "start",
      item: mobStartItem,
    },
    {
      name: "next",
      item: mobNextItem,
    },
    { name: "menu", item: mobMenuItem },
  ];
}
