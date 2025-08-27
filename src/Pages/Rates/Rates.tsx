import { useEffect, useState, useMemo, useCallback } from "react";
import DropDown from "../../Components/DropDown";
import ProgressBar from "../../Components/ProgressBar";
import Loader from "../../Components/Loader";
import { useAnimationFrame } from "../../Hooks/useAnimationFrame";
import CountryDataJson from "../../Libs/Countries.json";
import countryToCurrency from "../../Libs/CountryCurrency.json";
import classes from "./Rates.module.css";

const countries = (CountryDataJson as CountryData).CountryCodes;

type CountryData = {
  CountryCodes: Array<{
    code: string;
    name: string;
  }>;
};

interface PaytronResponse {
  buyCurrency: string;
  createdAt: string;
  id: string;
  indicative: boolean;
  retailRate: number;
  sellCurrency: string;
  validUntil: string;
  wholesaleRate: number;
}

const MARGIN = 0.005;

const getCurrencyCode = (countryCode: string): string => {
  return countryToCurrency[countryCode as keyof typeof countryToCurrency] || "";
};

const Rates = () => {
  const [fromCountry, setFromCountry] = useState("AU");
  const [fromAmount, setFromAmount] = useState(0);
  const [toCountry, setToCountry] = useState("US");

  const [exchangeRate, setExchangeRate] = useState(0.7456);
  const [progression, setProgression] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const Flag = ({ code }: { code: string }) => (
    <img
      alt={code || ""}
      src={`/img/flags/${code || ""}.svg`}
      width="20px"
      className={classes.flag}
    />
  );

  const fetchData = useCallback(
    async (isRetry = false) => {
      const API_URL = new URL(
        `https://rates.staging.api.paytron.com/rate/public`
      );
      API_URL.searchParams.set("sellCurrency", getCurrencyCode(fromCountry));
      API_URL.searchParams.set("buyCurrency", getCurrencyCode(toCountry));

      if (!loading) {
        setLoading(true);
        setError(null);

        try {
          const response = await fetch(API_URL.toString(), {
            method: "GET",
            headers: { accept: "application/json" },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data: PaytronResponse = await response.json();

          // Validate response
          if (!data.retailRate || typeof data.retailRate !== "number") {
            throw new Error("Invalid exchange rate data received");
          }

          setExchangeRate(data.retailRate);
          setRetryCount(0); // Reset retry count on success
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch exchange rate";
          console.error("Exchange rate fetch error:", errorMessage);
          setError(errorMessage);

          // Auto-retry with exponential backoff (up to 3 times)
          if (!isRetry && retryCount < 3) {
            const retryDelay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
            setTimeout(() => {
              setRetryCount((prev) => prev + 1);
              fetchData(true);
            }, retryDelay);
          }
        } finally {
          setLoading(false);
        }
      }
    },
    [fromCountry, toCountry, loading, retryCount]
  );

  useEffect(() => {
    fetchData();
    setProgression(0); // reset progress bar
  }, [fromCountry, toCountry]);

  // Demo progress bar moving :)
  useAnimationFrame(!loading, (deltaTime) => {
    setProgression((prevState) => {
      if (prevState > 0.998) {
        fetchData();
        return 0;
      }
      return (prevState + deltaTime * 0.0001) % 1;
    });
  });

  // Memoize expensive calculations
  const conversionResults = useMemo(() => {
    const trueAmount = fromAmount * exchangeRate;
    const ofxAmount = fromAmount * (1 - MARGIN) * exchangeRate;
    return {
      trueAmount: trueAmount.toFixed(2),
      ofxAmount: ofxAmount.toFixed(2),
    };
  }, [fromAmount, exchangeRate]);

  const DROPDOWN_OPTIONS = useMemo(
    () =>
      countries.map(({ code }) => ({
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
              className={classes.amountInput}
              type="number"
              placeholder="0.00"
              value={fromAmount || ""}
              onChange={(e) => setFromAmount(Number(e.target.value) || 0)}
              aria-label="Amount to convert"
              aria-describedby="conversion-results"
            />
          </div>

          {/* Exchange Rate - Bottom Center */}
          <div className={classes.exchangeWrapperBottom}>
            <div className={classes.rate}>{exchangeRate}</div>
          </div>

          {/* Output - Bottom Right */}
          <div
            id="conversion-results"
            className={classes.amountWrapper}
            aria-live="polite"
          >
            <span
              className={classes.rate}
              aria-label={`OFX conversion result: ${
                conversionResults.ofxAmount
              } ${getCurrencyCode(toCountry)}`}
            >
              OFX rate: {conversionResults.ofxAmount}
            </span>
            <span
              className={classes.rate}
              aria-label={`True conversion result: ${
                conversionResults.trueAmount
              } ${getCurrencyCode(toCountry)}`}
            >
              True rate: {conversionResults.trueAmount}
            </span>
          </div>
        </div>

        <ProgressBar
          progress={progression}
          animationClass={loading ? classes.slow : ""}
          style={{ marginTop: "20px" }}
        />

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
            {retryCount < 3 && (
              <p style={{ margin: "0", fontSize: "12px", fontStyle: "italic" }}>
                Retrying automatically... (Attempt {retryCount + 1}/3)
              </p>
            )}
            {retryCount >= 3 && (
              <button
                onClick={() => {
                  setRetryCount(0);
                  fetchData();
                }}
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Rates;
