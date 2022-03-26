export function timerInputValidator(input: string): string | null {
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
}
