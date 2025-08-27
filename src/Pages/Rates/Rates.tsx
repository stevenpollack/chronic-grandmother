import { useEffect, useState } from "react";
import DropDown from "../../Components/DropDown";
import ProgressBar from "../../Components/ProgressBar";
import Loader from "../../Components/Loader";

import { useAnimationFrame } from "../../Hooks/useAnimationFrame";

import classes from "./Rates.module.css";

import CountryData from "../../Libs/Countries.json";
import countryToCurrency from "../../Libs/CountryCurrency.json";

let countries = CountryData.CountryCodes;

const MARGIN = 0.005;

const Rates = () => {
  const [fromCurrency, setFromCurrency] = useState("AU");
  const [fromAmount, setFromAmount] = useState(0);
  const [toCurrency, setToCurrency] = useState("US");

  const [exchangeRate, setExchangeRate] = useState(0.7456);
  const [progression, setProgression] = useState(0);
  const [loading, setLoading] = useState(false);

  const Flag = ({ code }: { code: string }) => (
    <img
      alt={code || ""}
      src={`/img/flags/${code || ""}.svg`}
      width="20px"
      className={classes.flag}
    />
  );

  const fetchData = async () => {
    if (!loading) {
      setLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      setLoading(false);
    }
  };

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

  return (
    <div className={classes.container}>
      <div className={classes.content}>
        <div className={classes.heading}>Currency Conversion</div>

        <div className={classes.rowWrapper}>
          {/* From Dropdown - Top Left */}
          <div
            className={`${classes.dropdownContainer} ${classes.fromDropdown}`}
          >
            <DropDown
              leftIcon={<Flag code={fromCurrency} />}
              label={"From"}
              selected={
                countryToCurrency[
                  fromCurrency as keyof typeof countryToCurrency
                ]
              }
              options={countries.map(({ code }) => ({
                option:
                  countryToCurrency[code as keyof typeof countryToCurrency],
                key: code,
                icon: <Flag code={code} />,
              }))}
              setSelected={(key: string) => {
                setFromCurrency(key);
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
              leftIcon={<Flag code={toCurrency} />}
              label={"To"}
              selected={
                countryToCurrency[toCurrency as keyof typeof countryToCurrency]
              }
              options={countries.map(({ code }) => ({
                option:
                  countryToCurrency[code as keyof typeof countryToCurrency],
                key: code,
                icon: <Flag code={code} />,
              }))}
              setSelected={(key: string) => {
                setToCurrency(key);
              }}
              style={{}}
            />
          </div>

          {/* Input - Bottom Left */}
          <div className={`${classes.inputContainer} ${classes.fromInput}`}>
            <input
              className={classes.amountInput}
              type="number"
              placeholder="0.00"
              value={fromAmount || ""}
              onChange={(e) => setFromAmount(Number(e.target.value) || 0)}
            />
          </div>

          {/* Exchange Rate - Bottom Center */}
          <div className={classes.exchangeWrapperBottom}>
            <div className={classes.rate}>{exchangeRate}</div>
          </div>

          {/* Output - Bottom Right */}
          <div className={classes.amountWrapper}>
            <span className={classes.rate}>
              OFX rate: {(fromAmount * (1 - MARGIN) * exchangeRate).toFixed(2)}
            </span>
            <span className={classes.rate}>
              True rate: {(fromAmount * exchangeRate).toFixed(2)}
            </span>
          </div>
        </div>

        <ProgressBar
          progress={progression}
          animationClass={loading ? classes.slow : ""}
          style={{ marginTop: "20px" }}
        />

        {loading && (
          <div className={classes.loaderWrapper}>
            <Loader width={"25px"} height={"25px"} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Rates;
