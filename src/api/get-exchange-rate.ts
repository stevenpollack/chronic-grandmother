type ApiResponse = {
  buyCurrency: string;
  createdAt: string;
  id: string;
  indicative: boolean;
  retailRate: number;
  sellCurrency: string;
  validUntil: string;
  wholesaleRate: number;
};

export const API_URL = "https://rates.staging.api.paytron.com/rate/public";

export async function getExchangeRate({
  sellCurrency,
  buyCurrency,
}: {
  sellCurrency: string;
  buyCurrency: string;
}) {
  const url = `${API_URL}?sellCurrency=${sellCurrency}&buyCurrency=${buyCurrency}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    const body = await response.json();
    throw new Error(`${body.title}: ${body.detail}`);
  }

  const data: ApiResponse = await response.json();

  // Validate response
  if (!data.retailRate || typeof data.retailRate !== "number") {
    throw new Error("Invalid exchange rate data received");
  }

  return data.retailRate;
}
