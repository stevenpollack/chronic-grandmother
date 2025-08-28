import { server } from "../../mocks/node";
import Rates from "./Rates";
import { render, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { API_URL } from "../../api/get-exchange-rate";
import { calculateMarkup } from "../../Utils/markup-calculator";

describe("Rates", () => {
  const RETAIL_RATE = 0.6543;
  const MARGIN = 0.005;
  const apiPath = API_URL;
  const spy = vi.fn();
  let user: UserEvent;

  const successfulResponse = http.get(apiPath, ({ request }) => {
    const requestURL = request.url;
    const url = new URL(requestURL);
    spy(requestURL);
    return HttpResponse.json({
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

  beforeAll(() => {
    user = userEvent.setup();
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
    const { asFragment, getByTestId, container } = render(
      <Rates refreshRate={10} />
    );

    await waitFor(() => {
      expect(getByTestId("exchange-rate")).toHaveTextContent(
        RETAIL_RATE.toString()
      );
    });

    expect(asFragment()).toMatchSnapshot();
    expect(await axe(container)).toHaveNoViolations();
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

  it("should show both rates when user inputs a value", async () => {
    server.use(successfulResponse);
    const USER_AMOUNT = 100;
    const expectedOfxRate =
      USER_AMOUNT *
      calculateMarkup({
        exchangeRate: RETAIL_RATE,
        margin: MARGIN,
      });
    const expectedTrueRate = USER_AMOUNT * RETAIL_RATE;

    const { getByTestId } = render(<Rates refreshRate={10} margin={MARGIN} />);

    await user.type(getByTestId("amount-input"), USER_AMOUNT.toString());

    await waitFor(() => {
      expect(getByTestId("true-rate")).toHaveTextContent(
        expectedTrueRate.toFixed(2)
      );
      expect(getByTestId("ofx-rate")).toHaveTextContent(
        expectedOfxRate.toFixed(2)
      );
    });
  });
});
