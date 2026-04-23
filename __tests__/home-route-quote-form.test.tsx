import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";
import { HomeRouteQuoteForm } from "@/components/sections/HomeRouteQuoteForm";

describe("HomeRouteQuoteForm", () => {
  it("embeds the route step on the homepage and continues the quote by query params", () => {
    render(<HomeRouteQuoteForm />);

    const form = screen.getByRole("form", { name: /start your quote route/i });

    expect(form.getAttribute("action")).toBe("/quote");
    expect(form.getAttribute("method")).toBe("get");
    expect(screen.getByLabelText(/pickup address/i).getAttribute("name")).toBe("pickupAddress");
    expect(screen.getByLabelText(/dropoff address/i).getAttribute("name")).toBe("dropoffAddress");
    expect(screen.getByRole("button", { name: /continue quote/i })).toBeTruthy();
  });

  it("renders the route quote form directly in the homepage hero", () => {
    render(<HomePage />);

    expect(screen.getByRole("form", { name: /start your quote route/i })).toBeTruthy();
    expect(screen.queryByRole("link", { name: /start a quote/i })).toBeNull();
  });
});
