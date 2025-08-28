import CountryDataJson from "../Libs/Countries.json";
import countryToCurrency from "../Libs/CountryCurrency.json";

type CountryData = {
  CountryCodes: Array<{
    code: string;
    name: string;
  }>;
};

export const COUNTRIES = (CountryDataJson as CountryData).CountryCodes;

export const getCurrencyCode = (countryCode: string): string => {
  return countryToCurrency[countryCode as keyof typeof countryToCurrency] ?? "";
};
