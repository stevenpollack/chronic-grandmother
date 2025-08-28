import { useEffect, useState, useMemo, useCallback } from "react";
import DropDown from "../../Components/DropDown";
import ProgressBar from "../../Components/ProgressBar";
import Loader from "../../Components/Loader";
import { useAnimationFrame } from "../../Hooks/useAnimationFrame";

import classes from "./Rates.module.css";
import { Flag } from "../../Components/Flag/Flag";
import { calculateMarkup } from "../../Utils/markup-calculator";
import { COUNTRIES, getCurrencyCode } from "../../Utils/country-info";
import { getExchangeRate } from "../../api/get-exchange-rate";

type RatesProps = {
  /**
   * The rate of the exchange rate to refresh in milliseconds.
   * Default is 10_000ms (10 seconds).
   */
  refreshRate?: number;
  /**
   * The maximum number of retries to attempt when the API call fails.
   * Default is 3.
   */
  maxRetries?: number;
  /**
   * The margin to apply to the exchange rate.
   * Default is 0.005.
   */
  margin?: number;
};

const Rates = (props: RatesProps) => {
  const { refreshRate = 10_000, maxRetries = 3, margin = 0.005 } = props;

  const [fromCountry, setFromCountry] = useState("AU");
  const [fromAmount, setFromAmount] = useState(0);
  const [toCountry, setToCountry] = useState("US");

  const [exchangeRate, setExchangeRate] = useState(0);
  const [progression, setProgression] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = useCallback(async () => {
    if (!loading) {
      setLoading(true);
      setError(null);

      try {
        const exchangeRate = await getExchangeRate({
          sellCurrency: getCurrencyCode(fromCountry),
          buyCurrency: getCurrencyCode(toCountry),
        });

        setExchangeRate(exchangeRate);
        setRetryCount(0); // Reset retry count on success
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch exchange rate";
        console.error("Exchange rate fetch error:", errorMessage);
        setError(errorMessage);
        setExchangeRate(NaN);

        // Increment retry count for next attempt
        if (retryCount < maxRetries) {
          setRetryCount((prev) => prev + 1);
        }
      } finally {
        setLoading(false);
      }
    }
  }, [fromCountry, toCountry, loading, retryCount, maxRetries]);

  useEffect(() => {
    fetchData();
    setProgression(0); // reset progress bar
  }, [fromCountry, toCountry]);

  // Progress bar with retry multipliers: 1.5x, 2.25x, 3.375x
  useAnimationFrame(!loading, (deltaTime) => {
    const adjustedRefreshRate = refreshRate * Math.pow(1.5, retryCount);
    const PROGRESS_RATE = 1 / adjustedRefreshRate;

    setProgression((prevState) => {
      if (prevState > 0.998) {
        fetchData();
        return 0;
      }
      return (prevState + deltaTime * PROGRESS_RATE) % 1;
    });
  });

  // Memoize expensive calculations
  const conversionResults = useMemo(() => {
    const trueAmount = fromAmount * exchangeRate;
    const ofxAmount = fromAmount * calculateMarkup({ exchangeRate, margin });
    return {
      trueAmount: trueAmount.toFixed(2),
      ofxAmount: ofxAmount.toFixed(2),
    };
  }, [fromAmount, exchangeRate]);

  const DROPDOWN_OPTIONS = useMemo(
    () =>
      COUNTRIES.map(({ code }) => ({
        option: getCurrencyCode(code),
        key: code,
        icon: <Flag code={code} />,
      })),
    []
  );

  return (
    <div className={classes.container}>
      <div className={classes.content}>
        <h1 className={classes.heading}>Currency Conversion</h1>

        <div className={classes.rowWrapper}>
          {/* From Dropdown - Top Left */}
          <div
            className={`${classes.dropdownContainer} ${classes.fromDropdown}`}
          >
            <DropDown
              leftIcon={<Flag code={fromCountry} />}
              label={"From"}
              selected={getCurrencyCode(fromCountry)}
              options={DROPDOWN_OPTIONS}
              setSelected={(key: string) => {
                setFromCountry(key);
                setRetryCount(0);
                setProgression(0);
              }}
              style={{}}
            />
          </div>

          {/* Transfer Icon - Top Center */}
          <div className={classes.exchangeWrapper}>
            <div className={classes.transferIcon}>
              <img src="/img/icons/Transfer.svg" alt="Transfer icon" />
            </div>
          </div>

          {/* To Dropdown - Top Right */}
          <div className={`${classes.dropdownContainer} ${classes.toDropdown}`}>
            <DropDown
              leftIcon={<Flag code={toCountry} />}
              label={"To"}
              selected={getCurrencyCode(toCountry)}
              options={DROPDOWN_OPTIONS}
              setSelected={(key: string) => {
                setToCountry(key);
                setRetryCount(0);
                setProgression(0);
              }}
              style={{}}
            />
          </div>

          {/* Input - Bottom Left */}
          <div className={`${classes.inputContainer} ${classes.fromInput}`}>
            <label htmlFor="amount-input" className="sr-only">
              Amount to convert
            </label>
            <input
              id="amount-input"
              data-testid="amount-input"
              className={classes.amountInput}
              type="number"
              placeholder="0.00"
              value={fromAmount}
              onChange={(e) => setFromAmount(Number(e.target.value) || 0)}
              aria-label="Amount to convert"
              aria-describedby="conversion-results"
            />
          </div>

          {/* Exchange Rate - Bottom Center */}
          <div className={classes.exchangeWrapperBottom}>
            <div className={classes.rate} data-testid="exchange-rate">
              {exchangeRate.toString()}
            </div>
          </div>

          {/* Output - Bottom Right */}
          <div
            id="conversion-results"
            className={classes.amountWrapper}
            aria-live="polite"
          >
            <span
              className={classes.rate}
              data-testid="ofx-rate"
              aria-label={`OFX conversion result: ${
                conversionResults.ofxAmount
              } ${getCurrencyCode(toCountry)}`}
            >
              OFX rate: {conversionResults.ofxAmount}
            </span>
            <span
              className={classes.rate}
              data-testid="true-rate"
              aria-label={`True conversion result: ${
                conversionResults.trueAmount
              } ${getCurrencyCode(toCountry)}`}
            >
              True rate: {conversionResults.trueAmount}
            </span>
          </div>
        </div>

        {retryCount < maxRetries && (
          <ProgressBar
            progress={progression}
            animationClass={loading ? classes.slow : ""}
            style={{ marginTop: "20px" }}
          />
        )}

        {loading && (
          <div
            className={classes.loaderWrapper}
            role="status"
            aria-live="assertive"
          >
            <Loader width={"25px"} height={"25px"} />
            <span className="sr-only">Loading exchange rates...</span>
          </div>
        )}

        {error && (
          <div
            className={classes.errorWrapper}
            role="alert"
            aria-live="assertive"
            data-testid="error-message"
            style={{
              marginTop: "20px",
              padding: "12px",
              backgroundColor: "#fee",
              border: "1px solid #fcc",
              borderRadius: "4px",
              color: "#c33",
            }}
          >
            <p style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>
              ⚠️ Unable to fetch latest exchange rates
            </p>
            <p style={{ margin: "0 0 8px 0", fontSize: "14px" }}>{error}</p>
            {retryCount < maxRetries && (
              <p style={{ margin: "0", fontSize: "12px", fontStyle: "italic" }}>
                Retrying automatically... (Attempt {retryCount + 1}/{maxRetries}
                )
              </p>
            )}
            <button
              onClick={() => {
                setRetryCount(0);
                setProgression(0);
                setError(null);
                fetchData();
              }}
              data-testid="retry-button"
              style={{
                padding: "6px 12px",
                backgroundColor: "#3498db",
                color: "white",
                border: "none",
                borderRadius: "3px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rates;
