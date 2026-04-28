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
      expect(screen.getAllByText("$765 - $808").length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByRole("button", { name: /next: view estimate/i }));

    expect(screen.getByRole("heading", { name: /your estimate/i })).toBeTruthy();
    expect(screen.getAllByText("$765 - $808").length).toBeGreaterThan(0);
    expect(screen.getByText(/6 tonne truck · \$169\/hr recommended for this size\./i)).toBeTruthy();
    expect(screen.getAllByText("House, 2 bedrooms").length).toBeGreaterThan(0);
    expect(screen.queryByText(/recommended setup/i)).toBeNull();
    expect(screen.getByText(/truck \+ crew, 3 hours 45 min at \$169\/hr — covers 2 hours 30 min load\/unload \+ 1 hour 15 min travel\./i)).toBeTruthy();
    expect(screen.getByText("Base -> pickup: 1 hour 30 min (1 hour included, 30 min charged)")).toBeTruthy();
    expect(screen.getByText("Pickup -> drop-off: 20 min")).toBeTruthy();
    expect(screen.getByText("Drop-off -> base: 25 min")).toBeTruthy();
    expect(screen.getByText("Charged travel: 1 hour 15 min / 48.3 km")).toBeTruthy();
    expect(screen.getByText("$106")).toBeTruthy();
    expect(screen.getByText("$25")).toBeTruthy();
  });

  it("keeps base-to-pickup free when it is under an hour and still includes return-base travel", async () => {
    render(<QuoteForm initialPickupAddress="South Yarra VIC" initialDropoffAddress="Richmond VIC" />);

    await expectUiRouteFetch("South Yarra VIC", "Richmond VIC");

    fireEvent.click(screen.getByRole("radio", { name: /apartment \/ unit/i }));
    fireEvent.click(screen.getByRole("radio", { name: /2 bedrooms/i }));

    await waitFor(() => {
      expect(screen.getAllByText("$645 - $679").length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByRole("button", { name: /next: view estimate/i }));

    expect(screen.getByRole("heading", { name: /your estimate/i })).toBeTruthy();
    expect(screen.getAllByText("$645 - $679").length).toBeGreaterThan(0);
    expect(screen.getByText(/6 tonne truck · \$169\/hr recommended for this size\./i)).toBeTruthy();
    expect(screen.getAllByText("Apartment / unit, 2 bedrooms").length).toBeGreaterThan(0);
    expect(screen.getByText(/truck \+ crew, 3 hours 18 min at \$169\/hr — covers 2 hours 15 min load\/unload \+ 1 hour 3 min travel\./i)).toBeTruthy();
    expect(screen.getByText("Base -> pickup: 52 min, included")).toBeTruthy();
    expect(screen.getByText("Pickup -> drop-off: 28 min")).toBeTruthy();
    expect(screen.getByText("Drop-off -> base: 35 min")).toBeTruthy();
    expect(screen.getByText("Charged travel: 1 hour 3 min / 28.4 km")).toBeTruthy();
    expect(screen.getByText("$62")).toBeTruthy();
    expect(screen.getByText("$25")).toBeTruthy();
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
    expect(screen.getByText(/4 tonne truck · \$159\/hr recommended for this size\./i)).toBeTruthy();
    expect(screen.getAllByText("Small move").length).toBeGreaterThan(0);
    expect(screen.getByText(/truck \+ crew, 2 hours at \$159\/hr — 1 hour 15 min load\/unload \+ travel time pending\./i)).toBeTruthy();
    expect(screen.getByText(/travel cost is checked before the move is confirmed\./i)).toBeTruthy();
    expect(screen.queryByText(/Base -> pickup:/i)).toBeNull();
    expect(screen.getAllByText("Pending").length).toBeGreaterThan(0);
    expect(screen.getByText("$25")).toBeTruthy();
  });
});
