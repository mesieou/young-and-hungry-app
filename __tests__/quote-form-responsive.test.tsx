import { fireEvent, render, screen, within } from "@testing-library/react";
import { QuoteForm } from "@/components/sections/QuoteForm";

jest.mock("@/app/quote/actions", () => ({
  submitQuoteRequest: jest.fn()
}));

describe("QuoteForm responsive behavior", () => {
  it("keeps the move summary behind a drawer until the mobile trigger is used", () => {
    render(<QuoteForm />);

    expect(screen.queryByRole("dialog", { name: /your move summary/i })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /^view$/i }));

    const dialog = screen.getByRole("dialog", { name: /your move summary/i });
    const drawer = within(dialog);

    expect(dialog).toBeTruthy();
    expect(drawer.getByText(/^your move$/i)).toBeTruthy();
  });

  it("closes the move summary drawer from the close control", () => {
    render(<QuoteForm />);

    fireEvent.click(screen.getByRole("button", { name: /^view$/i }));
    fireEvent.click(within(screen.getByRole("dialog", { name: /your move summary/i })).getByRole("button", { name: /close your move summary/i }));

    expect(screen.queryByRole("dialog", { name: /your move summary/i })).toBeNull();
  });
});
