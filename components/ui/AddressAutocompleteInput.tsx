"use client";

import { MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { inputShellClasses } from "@/components/ui/Input";

const GOOGLE_MAPS_SCRIPT_ID = "yh-google-maps-places";

type GoogleAutocomplete = {
  addListener: (eventName: "place_changed", callback: () => void) => void;
  getPlace: () => {
    formatted_address?: string;
    name?: string;
  };
};

type GoogleMapsWindow = Window & {
  google?: {
    maps?: {
      places?: {
        Autocomplete: new (
          input: HTMLInputElement,
          options: {
            componentRestrictions?: { country: string | string[] };
            fields?: string[];
            types?: string[];
          }
        ) => GoogleAutocomplete;
      };
    };
  };
};

type AddressAutocompleteInputProps = {
  id: string;
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  countries?: string[];
  mapsApiKey?: string;
  onValueChange?: (value: string) => void;
};

let googleMapsScriptPromise: Promise<void> | null = null;

function loadGooglePlaces(apiKey: string) {
  const mapsWindow = window as GoogleMapsWindow;

  if (mapsWindow.google?.maps?.places?.Autocomplete) {
    return Promise.resolve();
  }

  if (googleMapsScriptPromise) {
    return googleMapsScriptPromise;
  }

  googleMapsScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Google Maps failed to load.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps failed to load."));
    document.head.appendChild(script);
  });

  return googleMapsScriptPromise;
}

export function AddressAutocompleteInput({
  id,
  name,
  label,
  defaultValue = "",
  placeholder = "Start typing an address...",
  required = false,
  disabled = false,
  error,
  className,
  countries = ["au"],
  mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  onValueChange
}: AddressAutocompleteInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<GoogleAutocomplete | null>(null);
  const latestOnValueChange = useRef(onValueChange);
  const [value, setValue] = useState(defaultValue);
  const [isLookupUnavailable, setIsLookupUnavailable] = useState(false);

  useEffect(() => {
    latestOnValueChange.current = onValueChange;
  }, [onValueChange]);

  useEffect(() => {
    if (!mapsApiKey || disabled || autocompleteRef.current || !inputRef.current) return;

    loadGooglePlaces(mapsApiKey)
      .then(() => {
        const mapsWindow = window as GoogleMapsWindow;
        const Autocomplete = mapsWindow.google?.maps?.places?.Autocomplete;

        if (!Autocomplete || !inputRef.current) {
          setIsLookupUnavailable(true);
          return;
        }

        const autocomplete = new Autocomplete(inputRef.current, {
          componentRestrictions: { country: countries },
          fields: ["formatted_address", "name"],
          types: ["address"]
        });

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          const selectedAddress = place.formatted_address || place.name || inputRef.current?.value || "";

          setValue(selectedAddress);
          latestOnValueChange.current?.(selectedAddress);
        });

        autocompleteRef.current = autocomplete;
      })
      .catch(() => {
        setIsLookupUnavailable(true);
      });
  }, [countries, disabled, mapsApiKey]);

  function handleChange(nextValue: string) {
    setValue(nextValue);
    onValueChange?.(nextValue);
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <label htmlFor={id} className="text-sm font-medium text-text-secondary">
        {label}
      </label>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          ref={inputRef}
          id={id}
          name={name}
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          placeholder={mapsApiKey && !isLookupUnavailable ? "Start typing to search..." : placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          autoComplete="street-address"
          className={cn(inputShellClasses, "pl-11")}
        />
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-sm text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
