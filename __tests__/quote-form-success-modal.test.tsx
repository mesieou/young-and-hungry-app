import { fireEvent, render, screen } from "@testing-library/react";
import { QuoteSuccessModal } from "@/components/sections/QuoteForm";

describe("QuoteSuccessModal", () => {
  it("shows a customer-safe success message without exposing the quote id", () => {
    render(<QuoteSuccessModal onReturnHome={jest.fn()} />);

    expect(screen.getByRole("dialog", { name: "We received your move details." })).toBeTruthy();
    expect(screen.getByText("Quote request sent")).toBeTruthy();
    expect(screen.getByText(/return to the main page automatically/i)).toBeTruthy();
    expect(screen.queryByText(/quote id/i)).toBeNull();
  });

  it("lets the customer return home immediately", () => {
    const onReturnHome = jest.fn();

    render(<QuoteSuccessModal onReturnHome={onReturnHome} />);
    fireEvent.click(screen.getByRole("button", { name: /back to home now/i }));

    expect(onReturnHome).toHaveBeenCalledTimes(1);
  });
});
