import { calculateMarkup } from "./markup-calculator";

describe("calculateMarkup", () => {
  const TEST_CASES = [
    {
      caseName: "example 1",
      exchangeRate: 1,
      margin: 0.005,
      expectedMarkup: 0.995,
    },
    {
      caseName: "example 2",
      exchangeRate: 50.00,
      margin: 0.005,
      expectedMarkup: 49.75,
    }
  ]
  it.each(TEST_CASES)("$caseName", ({exchangeRate, margin, expectedMarkup}) => {
    const markup = calculateMarkup({exchangeRate, margin});
    expect(markup).toBe(expectedMarkup);
  });
})