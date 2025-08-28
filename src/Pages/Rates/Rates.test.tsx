import { server } from "../../mocks/node";
import Rates, { API_URL, ApiResponse } from "./Rates";
import { render, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import userEvent from "@testing-library/user-event";

describe("Rates", () => {
  const RETAIL_RATE = 0.6543;
  const apiPath = API_URL.toString();
  const spy = vi.fn();

  const successfulResponse = http.get(apiPath, ({ request }) => {
    const requestURL = request.url;
    const url = new URL(requestURL);
    spy(requestURL);
    return HttpResponse.json<ApiResponse>({
      buyCurrency: url.searchParams.get("buyCurrency") || "",
      createdAt: "2021-01-01",
      id: "1",
      indicative: false,
      retailRate: RETAIL_RATE,
      sellCurrency: url.searchParams.get("sellCurrency") || "",
      validUntil: "2021-01-01",
      wholesaleRate: 1.0,
    });
  });

  const errorResponse = http.get(apiPath, () => {
    return HttpResponse.json(
      {
        error: "API error",
      },
      { status: 500 }
    );
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls the rates API on render", async () => {
    server.use(successfulResponse);
    render(<Rates refreshRate={10} />);
    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });
  });

  it("renders correctly with default props", async () => {
    server.use(successfulResponse);
    const { asFragment, getByTestId } = render(<Rates refreshRate={10} />);

    await waitFor(() => {
      expect(getByTestId("exchange-rate")).toHaveTextContent(
        RETAIL_RATE.toString()
      );
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it("renders an error message when the API call fails", async () => {
    server.use(errorResponse);
    const { getByTestId } = render(<Rates refreshRate={10} maxRetries={1} />);

    await waitFor(() => {
      expect(getByTestId("error-message")).toBeVisible();
    });
  });

  it("renders a functional retry button when API call fails", async () => {
    server.use(errorResponse);
    const { getByTestId } = render(<Rates refreshRate={250} maxRetries={1} />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(getByTestId("retry-button")).toBeInTheDocument();
      expect(getByTestId("retry-button")).toBeEnabled();
    });

    // Retry button should trigger a new API call
    server.use(successfulResponse);
    await user.click(getByTestId("retry-button"));
    await waitFor(() => {
      expect(successfulResponse.isUsed).toBe(true);
    });
  });
});
