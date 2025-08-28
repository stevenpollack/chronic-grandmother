import classes from "./Flag.module.css";

export function Flag({ code }: { code: string }) {
  return (
    <img
      alt={code || ""}
      src={`/img/flags/${code || ""}.svg`}
      width="20px"
      className={classes.flag}
      data-testid={`${code}-flag-icon`}
    />
  );
}
