import { http, passthrough } from "msw";
import { server } from "../mocks/node";
import { API_URL, getExchangeRate } from "./get-exchange-rate";

describe("getExchangeRate", () => {
  
  beforeEach(() => {
    server.use(http.get(API_URL, () => {
      return passthrough()
    }))
  })

  it("should return an exchange rate for a valid currency pair", async () => {
    const exchangeRate = await getExchangeRate({
      sellCurrency: "AUD",
      buyCurrency: "NZD",
    });

    expect(exchangeRate).toBeGreaterThan(0);
    expect(exchangeRate).toBeLessThan(2);
  });

  it("should throw an error for an invalid currency pair", async () => {
    await expect(getExchangeRate({
      sellCurrency: "AUD",
      buyCurrency: "INVALID",
    })).rejects.toThrowError(/Issue Fetching FX Rate/g);
  });

  it("should throw an error for valid pair without a rate", async () => {
    await expect(getExchangeRate({
      sellCurrency: "AUD",
      buyCurrency: "ARS",
    })).rejects.toThrowError(/Issue Fetching FX Rate/g);
  });
});