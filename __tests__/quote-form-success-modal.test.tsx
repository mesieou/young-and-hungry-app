import { fireEvent, render, screen } from "@testing-library/react";
import { QuoteForm, QuoteSuccessModal } from "@/components/sections/QuoteForm";

jest.mock("@/app/quote/actions", () => ({
  submitQuoteRequest: jest.fn()
}));

describe("QuoteForm", () => {
  it("uses a five-step Lugg-style quote flow", () => {
    render(<QuoteForm />);

    expect(screen.getByRole("button", { name: /01 route/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /02 job/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /03 estimate/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /04 schedule/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /05 submit/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /next: job & truck/i })).toBeTruthy();
  });

  it("blocks forward progress until required step data is entered", () => {
    render(<QuoteForm />);

    fireEvent.click(screen.getByRole("button", { name: /next: job & truck/i }));
    expect(screen.getByRole("alert").textContent).toContain("Enter pickup and dropoff addresses");

    fireEvent.change(screen.getByLabelText(/pickup address/i), {
      target: { value: "South Yarra VIC" }
    });
    fireEvent.change(screen.getByLabelText(/dropoff address/i), {
      target: { value: "Richmond VIC" }
    });
    fireEvent.click(screen.getByRole("button", { name: /next: job & truck/i }));

    expect(screen.getByRole("heading", { name: /choose job type & truck/i })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /next: review estimate/i }));
    expect(screen.getByRole("alert").textContent).toContain("Choose a 4 tonne or 6 tonne truck");
  });

  it("starts at truck selection when the homepage route step has already supplied addresses", () => {
    render(<QuoteForm initialPickupAddress="South Yarra VIC" initialDropoffAddress="Richmond VIC" />);

    expect(screen.getByRole("heading", { name: /choose job type & truck/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /01 route/i }).className).toContain("bg-success/80");
    expect(screen.getByDisplayValue("South Yarra VIC").getAttribute("name")).toBe("pickupAddress");
    expect(screen.getByDisplayValue("Richmond VIC").getAttribute("name")).toBe("dropoffAddress");
  });

  it("keeps values through the flow and reaches the reviewed quote CTA", () => {
    render(<QuoteForm />);

    fireEvent.change(screen.getByLabelText(/pickup address/i), {
      target: { value: "South Yarra VIC" }
    });
    fireEvent.change(screen.getByLabelText(/dropoff address/i), {
      target: { value: "Richmond VIC" }
    });
    fireEvent.click(screen.getByRole("button", { name: /next: job & truck/i }));

    fireEvent.click(screen.getByLabelText(/house move/i));
    fireEvent.click(screen.getByLabelText(/6 tonne truck/i));
    expect(screen.getAllByText("6 tonne truck").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$532 - $701").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: /next: review estimate/i }));

    expect(screen.getByRole("heading", { name: /your estimate/i })).toBeTruthy();
    expect(screen.getByText(/labour/i)).toBeTruthy();
    expect(screen.getByText(/truck \+ crew, 3 hours estimated time/i)).toBeTruthy();
    expect(screen.getByText(/calculated on the day of the job/i)).toBeTruthy();
    expect(screen.queryByText(/route calculation/i)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /next: schedule/i }));

    fireEvent.change(screen.getByLabelText(/preferred date/i), {
      target: { value: "2026-05-01" }
    });
    fireEvent.click(screen.getByLabelText(/afternoon/i));
    fireEvent.click(screen.getByRole("button", { name: /next: details/i }));

    fireEvent.change(screen.getByLabelText(/what are you moving/i), {
      target: { value: "Three bedroom house with lift access." }
    });

    expect(screen.getByRole("button", { name: /request reviewed quote/i })).toBeTruthy();
    expect(screen.getByText(/South Yarra VIC/)).toBeTruthy();
    expect(screen.getByText(/Richmond VIC/)).toBeTruthy();
  });

  it("lets the user click back to earlier steps and edit them", () => {
    render(<QuoteForm />);

    fireEvent.change(screen.getByLabelText(/pickup address/i), {
      target: { value: "South Yarra VIC" }
    });
    fireEvent.change(screen.getByLabelText(/dropoff address/i), {
      target: { value: "Richmond VIC" }
    });
    fireEvent.click(screen.getByRole("button", { name: /next: job & truck/i }));

    fireEvent.click(screen.getByLabelText(/6 tonne truck/i));
    fireEvent.click(screen.getByRole("button", { name: /02 job/i }));
    expect(screen.getByRole("heading", { name: /choose job type & truck/i })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /01 route/i }));
    expect(screen.getByRole("heading", { name: /where are you moving/i })).toBeTruthy();
  });

  it("uses a country-code phone input and validates Australian numbers before submit", () => {
    render(<QuoteForm initialPickupAddress="South Yarra VIC" initialDropoffAddress="Richmond VIC" />);

    fireEvent.click(screen.getByLabelText(/6 tonne truck/i));
    fireEvent.click(screen.getByRole("button", { name: /next: review estimate/i }));
    fireEvent.click(screen.getByRole("button", { name: /next: schedule/i }));
    fireEvent.click(screen.getByRole("button", { name: /next: details/i }));

    fireEvent.change(screen.getByLabelText(/^name$/i), {
      target: { value: "Juan Customer" }
    });
    fireEvent.change(screen.getByLabelText(/^phone$/i), {
      target: { value: "1234" }
    });
    fireEvent.click(screen.getByRole("button", { name: /request reviewed quote/i }));
    expect(screen.getByRole("alert").textContent).toContain("Enter a valid Australian phone number");

    fireEvent.change(screen.getByLabelText(/^phone$/i), {
      target: { value: "0412 345 678" }
    });
    expect(screen.getByDisplayValue("+61412345678").getAttribute("name")).toBe("phone");
  });
});

describe("QuoteSuccessModal", () => {
  it("shows a customer-safe success message without exposing the quote id", () => {
    render(<QuoteSuccessModal onReturnHome={jest.fn()} />);

    expect(screen.getByRole("dialog", { name: "We received your move details." })).toBeTruthy();
    expect(screen.getByText("Quote request sent")).toBeTruthy();
    expect(screen.getByText(/stays here until you choose where to go next/i)).toBeTruthy();
    expect(screen.queryByText(/quote id/i)).toBeNull();
  });

  it("lets the customer return home immediately", () => {
    const onReturnHome = jest.fn();

    render(<QuoteSuccessModal onReturnHome={onReturnHome} />);
    fireEvent.click(screen.getByRole("button", { name: /back to home now/i }));

    expect(onReturnHome).toHaveBeenCalledTimes(1);
  });
});
