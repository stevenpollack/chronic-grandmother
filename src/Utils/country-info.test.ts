import { getCurrencyCode } from "./country-info";

describe("getCurrencyCode", () => {
  const TEST_CASES = [
    {
      countryCode: "AU",
      currencyCode: "AUD",
    },
    {
      countryCode: "US",
      currencyCode: "USD",
    },
    {
      countryCode: "NZ",
      currencyCode: "NZD",
    },
    {
      countryCode: "GB",
      currencyCode: "GBP",
    }
   ]
  it.each(TEST_CASES)("$countryCode => $currencyCode", ({countryCode, currencyCode}) => {
    expect(getCurrencyCode(countryCode)).toBe(currencyCode);
  });

  it("should return an empty string if the country code is not found", () => {
    expect(getCurrencyCode("XX")).toBe("");
  });

})