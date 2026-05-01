export const cx = (
  ...classes: Array<string | false | null | undefined | 0 | 0n | "">
) =>
  classes.filter(Boolean).join(" ");
