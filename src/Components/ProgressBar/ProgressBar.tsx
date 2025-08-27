import { useLayoutEffect, useRef, useState } from "react";

import classes from "./ProgressBar.module.css";

type ProgressBarProps = {
  progress: number; // 0.0 - 1.0
  animationClass?: string;
  style?: React.CSSProperties;
};

const ProgressBar = (props: ProgressBarProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    if (ref.current) {
      setWidth(ref.current.offsetWidth);
    }
  }, []);

  return (
    <div ref={ref} className={classes.base} style={props.style}>
      <div
        className={`${classes.progress} ${props.animationClass || ""}`}
        style={{ transform: `translate(-${width * (1 - props.progress)}px)` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
