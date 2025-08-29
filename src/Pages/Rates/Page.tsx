import { useLocation } from "react-router-dom";

import CurrencyConverter from "../../Components/CurrencyConverter/currency-converter";
import classes from "./page.module.css";

export default function RatesPage() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  // these parameters are for debugging purposes
  const margin = Number(params.get("margin") ?? 0.005);
  const refreshRate = Number(params.get("refreshRate") ?? 10_000);
  const maxRetries = Number(params.get("maxRetries") ?? 3);

  return (
    <div className={classes.container}>
      <div className={classes.content}>
        <h1 className={classes.heading}>Currency Conversion</h1>

        <CurrencyConverter
          margin={margin}
          refreshRate={refreshRate}
          maxRetries={maxRetries}
        />
      </div>
    </div>
  );
}
