import DropDown, { DropDownProps } from "./DropDown";
import userEvent from "@testing-library/user-event";
import { render, waitFor } from "@testing-library/react";
import { Flag } from "../Flag/Flag";

const OPTIONS: DropDownProps["options"] = [
  { option: "AUD", key: "AU", icon: <Flag code="AU" /> },
  { option: "USD", key: "US", icon: <Flag code="US" /> },
  { option: "GBP", key: "GB", icon: <Flag code="GB" /> },
  { option: "JPY", key: "JP", icon: <Flag code="JP" /> },
];

describe("DropDown", () => {
  const defaultProps: DropDownProps = {
    selected: OPTIONS[0].option,
    setSelected: vi.fn(),
    label: "From",
    options: OPTIONS,
    leftIcon: OPTIONS[0].icon,
    style: {},
  };

  function renderDropDown(props?: DropDownProps) {
    const mergedProps = { ...defaultProps, ...props };

    return {
      user: userEvent.setup(),
      ...render(<DropDown {...mergedProps} />),
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with provided props", () => {
    const { getByTestId, asFragment } = renderDropDown();

    expect(getByTestId(`${defaultProps.label}-value`)).toHaveTextContent(
      defaultProps.selected
    );
    expect(getByTestId(`${OPTIONS[0].key}-flag-icon`)).toBeVisible();
    expect(getByTestId("dropdown-button")).toBeVisible();
    expect(getByTestId("dropdown-button")).toBeEnabled();

    // match snapshot
    expect(asFragment()).toMatchSnapshot();
  });

  it("presents options when button is clicked", async () => {
    const { user, getByTestId, getByText } = renderDropDown();

    await user.click(getByTestId("dropdown-button"));

    await waitFor(() => {
      // we don't need to test the first option as it is already selected
      OPTIONS.slice(1).forEach((option) => {
        expect(getByText(option.option)).toBeInTheDocument();
      });
    });
  });

  it("calls setSelected when option is clicked", async () => {
    const { user, getByTestId, getByText } = renderDropDown();

    await user.click(getByTestId("dropdown-button"));

    await waitFor(async () => {
      const usdOption = getByText(OPTIONS[1].option);
      await user.click(usdOption);
    });

    expect(defaultProps.setSelected).toHaveBeenCalledWith(OPTIONS[1].key);
  });

  it("closes dropdown when option is selected", async () => {
    const { user, getByTestId, getByText, queryByRole, getByRole } =
      renderDropDown();

    await user.click(getByTestId("dropdown-button"));

    await waitFor(async () => {
      expect(getByRole("listbox")).toBeInTheDocument();
      const usdOption = getByText(OPTIONS[1].option);
      await user.click(usdOption);
    });

    await waitFor(() => {
      expect(queryByRole("listbox")).toBeNull();
    });
  });

  it("closes dropdown when clicking outside", async () => {
    const { user, getByTestId, queryByRole, getByRole, container } =
      renderDropDown();

    await user.click(getByTestId("dropdown-button"));

    await waitFor(() => {
      expect(getByRole("listbox")).toBeInTheDocument();
    });

    // Click outside the dropdown
    await user.click(container);

    await waitFor(() => {
      expect(queryByRole("listbox")).toBeNull();
    });
  });

  it("toggles dropdown state when clicking button multiple times", async () => {
    const { user, getByTestId, queryByRole, getByRole, container } =
      renderDropDown();

    // Open dropdown
    await user.click(getByTestId("dropdown-button"));
    await waitFor(() => {
      expect(getByRole("listbox")).toBeInTheDocument();
    });

    // Close dropdown
    await user.click(getByTestId("dropdown-button"));
    await waitFor(() => {
      expect(queryByRole("listbox")).toBeNull();
    });
  });
});
