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
    expect(screen.getByRole("button", { name: /next: move type/i })).toBeTruthy();
  });

  it("blocks forward progress until required step data is entered", () => {
    render(<QuoteForm />);

    fireEvent.click(screen.getByRole("button", { name: /next: move type/i }));
    expect(screen.getByRole("alert").textContent).toContain("Enter pickup and drop-off addresses");

    fireEvent.change(screen.getByLabelText(/pickup address/i), {
      target: { value: "South Yarra VIC" }
    });
    fireEvent.change(screen.getByLabelText(/dropoff address/i), {
      target: { value: "Richmond VIC" }
    });
    fireEvent.click(screen.getByRole("button", { name: /next: move type/i }));

    expect(screen.getByRole("heading", { name: /choose move type/i })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /next: view estimate/i }));
    expect(screen.getByRole("alert").textContent).toContain("Choose what you are moving");
  });

  it("starts at move type selection when the homepage route step has already supplied addresses", () => {
    render(<QuoteForm initialPickupAddress="South Yarra VIC" initialDropoffAddress="Richmond VIC" />);

    expect(screen.getByRole("heading", { name: /choose move type/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /01 route/i }).className).toContain("bg-success/80");
    expect(screen.getByDisplayValue("South Yarra VIC").getAttribute("name")).toBe("pickupAddress");
    expect(screen.getByDisplayValue("Richmond VIC").getAttribute("name")).toBe("dropoffAddress");
  });

  it("keeps values through the flow and reaches the quote request CTA", () => {
    render(<QuoteForm />);

    fireEvent.change(screen.getByLabelText(/pickup address/i), {
      target: { value: "South Yarra VIC" }
    });
    fireEvent.change(screen.getByLabelText(/dropoff address/i), {
      target: { value: "Richmond VIC" }
    });
    fireEvent.click(screen.getByRole("button", { name: /next: move type/i }));

    fireEvent.click(screen.getByRole("radio", { name: /house/i }));
    fireEvent.click(screen.getByRole("radio", { name: /3 bedrooms/i }));
    expect(screen.getAllByText("House, 3 bedrooms").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$617 - $786").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: /next: view estimate/i }));

    expect(screen.getByRole("heading", { name: /your estimate/i })).toBeTruthy();
    expect(screen.getByText(/6 tonne truck · \$169\/hr recommended for this size\./i)).toBeTruthy();
    expect(screen.getByText(/labour/i)).toBeTruthy();
    expect(screen.getByText(/truck \+ crew, 3.5 hours estimated time/i)).toBeTruthy();
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

    expect(screen.getByRole("button", { name: /send quote request/i })).toBeTruthy();
    expect(screen.getAllByText(/South Yarra VIC/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Richmond VIC/).length).toBeGreaterThan(0);
  });

  it("shows 4+ bedroom move sizes as coming soon", () => {
    render(<QuoteForm initialPickupAddress="South Yarra VIC" initialDropoffAddress="Richmond VIC" />);

    fireEvent.click(screen.getByRole("radio", { name: /house/i }));

    const fourBedroomSize = screen
      .getAllByRole("radio", { name: /4\+ bedrooms/i })
      .find((element) => element.getAttribute("name") === "moveSize");

    expect(fourBedroomSize).toBeTruthy();
    expect(fourBedroomSize?.hasAttribute("disabled")).toBe(true);
    expect(screen.getByText(/coming soon/i)).toBeTruthy();
  });

  it("lets the user click back to earlier steps and edit them", () => {
    render(<QuoteForm />);

    fireEvent.change(screen.getByLabelText(/pickup address/i), {
      target: { value: "South Yarra VIC" }
    });
    fireEvent.change(screen.getByLabelText(/dropoff address/i), {
      target: { value: "Richmond VIC" }
    });
    fireEvent.click(screen.getByRole("button", { name: /next: move type/i }));

    fireEvent.click(screen.getByRole("radio", { name: /house/i }));
    fireEvent.click(screen.getByRole("radio", { name: /2 bedrooms/i }));
    fireEvent.click(screen.getByRole("button", { name: /02 job/i }));
    expect(screen.getByRole("heading", { name: /choose move type/i })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /01 route/i }));
    expect(screen.getByRole("heading", { name: /where are you moving/i })).toBeTruthy();
  });

  it("uses a country-code phone input and validates Australian numbers before submit", () => {
    render(<QuoteForm initialPickupAddress="South Yarra VIC" initialDropoffAddress="Richmond VIC" />);

    fireEvent.click(screen.getByRole("radio", { name: /small move/i }));
    fireEvent.click(screen.getByRole("button", { name: /next: view estimate/i }));
    fireEvent.click(screen.getByRole("button", { name: /next: schedule/i }));
    fireEvent.click(screen.getByRole("button", { name: /next: details/i }));

    fireEvent.change(screen.getByLabelText(/^name$/i), {
      target: { value: "Juan Customer" }
    });
    fireEvent.change(screen.getByLabelText(/^phone$/i), {
      target: { value: "1234" }
    });
    fireEvent.click(screen.getByRole("button", { name: /send quote request/i }));
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

    expect(screen.getByRole("dialog", { name: /we’ve received your move details\./i })).toBeTruthy();
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
