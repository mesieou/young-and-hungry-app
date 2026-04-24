import { fireEvent, render, screen, within } from "@testing-library/react";
import { Header } from "@/components/layout/Header";

describe("Header responsive navigation", () => {
  it("opens the mobile drawer navigation and exposes the main routes", () => {
    render(<Header />);

    expect(screen.queryByRole("dialog", { name: /navigation/i })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /open navigation menu/i }));

    const dialog = screen.getByRole("dialog", { name: /navigation/i });
    const drawer = within(dialog);

    expect(dialog).toBeTruthy();
    expect(drawer.getByRole("link", { name: /how it works/i })).toBeTruthy();
    expect(drawer.getByRole("link", { name: /^services$/i })).toBeTruthy();
    expect(drawer.getByRole("link", { name: /^pricing$/i })).toBeTruthy();
    expect(drawer.getByRole("link", { name: /^faq$/i })).toBeTruthy();
  });

  it("closes the mobile drawer navigation", () => {
    render(<Header />);

    fireEvent.click(screen.getByRole("button", { name: /open navigation menu/i }));
    fireEvent.click(within(screen.getByRole("dialog", { name: /navigation/i })).getByRole("button", { name: /close navigation/i }));

    expect(screen.queryByRole("dialog", { name: /navigation/i })).toBeNull();
  });
});
