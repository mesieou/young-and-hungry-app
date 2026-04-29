import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { POST as routeEstimatePOST } from "@/app/api/quote/route-estimate/route";
import { QuoteForm } from "@/components/sections/QuoteForm";

jest.mock("@/app/quote/actions", () => ({
  submitQuoteRequest: jest.fn()
}));

function googleDirectionsResponse(legs: Array<{ distanceMeters: number; durationSeconds: number }>) {
  return {
    ok: true,
    json: async () => ({
      status: "OK",
      routes: [
        {
          legs: legs.map((leg) => ({
              distance: {
                value: leg.distanceMeters
              },
              duration: {
                value: leg.durationSeconds
              }
          }))
        }
      ]
    })
  } as Response;
}

function googleDirectionsFailure(status: string, message = "Google Directions could not calculate this route.") {
  return {
    ok: true,
    json: async () => ({
      status,
      error_message: message
    })
  } as Response;
}

function getGoogleRouteResponse(input: string | URL | Request) {
  const url = new URL(String(input));
  const origin = url.searchParams.get("origin");
  const destination = url.searchParams.get("destination");
  const waypoints = url.searchParams.get("waypoints");

  if (
    origin === "Sims St, West Melbourne VIC 3003" &&
    destination === "Sims St, West Melbourne VIC 3003" &&
    waypoints === "Geelong VIC|Richmond VIC"
  ) {
    return googleDirectionsResponse([
      { distanceMeters: 70000, durationSeconds: 5400 },
      { distanceMeters: 10000, durationSeconds: 1200 },
      { distanceMeters: 15000, durationSeconds: 1500 }
    ]);
  }

  if (
    origin === "Sims St, West Melbourne VIC 3003" &&
    destination === "Sims St, West Melbourne VIC 3003" &&
    waypoints === "South Yarra VIC|Richmond VIC"
  ) {
    return googleDirectionsResponse([
      { distanceMeters: 18000, durationSeconds: 3120 },
      { distanceMeters: 12400, durationSeconds: 1680 },
      { distanceMeters: 16000, durationSeconds: 2100 }
    ]);
  }

  if (
    origin === "Sims St, West Melbourne VIC 3003" &&
    destination === "Sims St, West Melbourne VIC 3003" &&
    waypoints === "Atlantis VIC|Richmond VIC"
  ) {
    return googleDirectionsFailure("ZERO_RESULTS");
  }

  throw new Error(`Unexpected Google Directions route: ${origin} -> ${waypoints} -> ${destination}`);
}

describe("QuoteForm route pricing integration", () => {
  const fetchBackup = global.fetch;
  const googleMapsKeyBackup = process.env.GOOGLE_MAPS_API_KEY;

  beforeEach(() => {
    process.env.GOOGLE_MAPS_API_KEY = "test-key";
    global.fetch = jest.fn(async (input: string | URL | Request, init?: RequestInit) => {
      if (input === "/api/quote/route-estimate") {
        return routeEstimatePOST(
          {
            json: async () => JSON.parse(String(init?.body ?? "{}"))
          } as Request
        ) as Promise<Response>;
      }

      if (String(input).startsWith("https://maps.googleapis.com/maps/api/directions/json")) {
        return getGoogleRouteResponse(input);
      }

      throw new Error(`Unexpected fetch: ${String(input)}`);
    }) as jest.Mock;
  });

  afterEach(() => {
    process.env.GOOGLE_MAPS_API_KEY = googleMapsKeyBackup;
    global.fetch = fetchBackup;
  });

  async function expectUiRouteFetch(pickupAddress: string, dropoffAddress: string) {
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/quote/route-estimate",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            pickupAddress,
            dropoffAddress
          })
        })
      );
    });

    await waitFor(() => {
      expect(
        (global.fetch as jest.Mock).mock.calls.filter(([input]) =>
          String(input).startsWith("https://maps.googleapis.com/maps/api/directions/json")
        )
      ).toHaveLength(1);
    });
  }

  it("uses the real UI route estimate flow for pickup excess, return-base travel, and 30-minute rounding", async () => {
    render(<QuoteForm initialPickupAddress="Geelong VIC" initialDropoffAddress="Richmond VIC" />);

    await expectUiRouteFetch("Geelong VIC", "Richmond VIC");

    fireEvent.click(screen.getByRole("radio", { name: /house/i }));
    fireEvent.click(screen.getByRole("radio", { name: /2 bedrooms/i }));

    await waitFor(() => {
      expect(screen.getAllByText("$659 - $701").length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByRole("button", { name: /next: view estimate/i }));

    expect(screen.getByRole("heading", { name: /your estimate/i })).toBeTruthy();
    expect(screen.getAllByText("$659 - $701").length).toBeGreaterThan(0);
    expect(screen.getByText(/House, 2 bedrooms · 2-man crew \+ 6 tonne truck/i)).toBeTruthy();
    expect(screen.getAllByText("House, 2 bedrooms").length).toBeGreaterThan(0);
    expect(screen.queryByText(/recommended setup/i)).toBeNull();
    expect(screen.getAllByText(/labour/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^Travel$/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("2h 30m").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Base → pickup/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("30m").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/first hour from base to pickup is free/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Pickup → drop-off/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("20m").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Drop-off → base/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("25m").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$423").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$85").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$56").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$70").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$25").length).toBeGreaterThan(0);
  });

  it("keeps base-to-pickup free when it is under an hour and still includes return-base travel", async () => {
    render(<QuoteForm initialPickupAddress="South Yarra VIC" initialDropoffAddress="Richmond VIC" />);

    await expectUiRouteFetch("South Yarra VIC", "Richmond VIC");

    fireEvent.click(screen.getByRole("radio", { name: /apartment \/ unit/i }));
    fireEvent.click(screen.getByRole("radio", { name: /2 bedrooms/i }));

    await waitFor(() => {
      expect(screen.getAllByText("$583 - $617").length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByRole("button", { name: /next: view estimate/i }));

    expect(screen.getByRole("heading", { name: /your estimate/i })).toBeTruthy();
    expect(screen.getAllByText("$583 - $617").length).toBeGreaterThan(0);
    expect(screen.getByText(/Apartment \/ unit, 2 bedrooms · 2-man crew \+ 6 tonne truck/i)).toBeTruthy();
    expect(screen.getAllByText("Apartment / unit, 2 bedrooms").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/labour/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^Travel$/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Base → pickup/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/first hour from base to pickup is free/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Included").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Pickup → drop-off/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("28m").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Drop-off → base/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("35m").length).toBeGreaterThan(0);
    expect(screen.getAllByText("2h 15m").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$380").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$79").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$99").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$25").length).toBeGreaterThan(0);
  });

  it("falls back to pending travel pricing when Google cannot return the route", async () => {
    render(<QuoteForm initialPickupAddress="Atlantis VIC" initialDropoffAddress="Richmond VIC" />);

    await expectUiRouteFetch("Atlantis VIC", "Richmond VIC");

    fireEvent.click(screen.getByRole("radio", { name: /small move/i }));

    await waitFor(() => {
      expect(screen.getAllByText("$343").length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByRole("button", { name: /next: view estimate/i }));

    expect(screen.getByRole("heading", { name: /your estimate/i })).toBeTruthy();
    expect(screen.getByText(/Small move · 2-man crew \+ 4 tonne truck/i)).toBeTruthy();
    expect(screen.getAllByText("Small move").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/labour/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/travel time is confirmed once we have your final addresses/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Base -> pickup:/i)).toBeNull();
    expect(screen.getAllByText("Pending").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$25").length).toBeGreaterThan(0);
  });
});
