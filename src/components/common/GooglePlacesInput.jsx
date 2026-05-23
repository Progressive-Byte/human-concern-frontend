"use client";

import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

const GooglePlacesInput = ({ value, onChange, onPlaceSelect, placeholder }) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [inputValue, setInputValue] = useState(value ?? "");

  // keep in sync when parent sets value (e.g. auth pre-fill)
  useEffect(() => {
    setInputValue(value ?? "");
  }, [value]);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === "AIzaSyAGJQEr8MSBv3Vf8OFhggbe01JbArhISeU") return;

    setOptions({ apiKey });

    importLibrary("places")
      .then(({ Autocomplete }) => {
        if (!inputRef.current) return;

        autocompleteRef.current = new Autocomplete(inputRef.current, {
          types: ["address"],
        });

        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current.getPlace();
          if (!place.address_components) return;

          const comp = {};
          place.address_components.forEach((c) => {
            c.types.forEach((t) => { comp[t] = c; });
          });

          const streetNumber = comp.street_number?.long_name ?? "";
          const route        = comp.route?.long_name ?? "";
          const addressLine1 = [streetNumber, route].filter(Boolean).join(" ")
            || place.formatted_address?.split(",")[0]
            || "";

          const parsed = {
            addressLine1,
            city:        comp.locality?.long_name
                      ?? comp.sublocality_level_1?.long_name
                      ?? comp.postal_town?.long_name
                      ?? "",
            province:    comp.administrative_area_level_1?.long_name ?? "",
            zip:         comp.postal_code?.long_name ?? "",
            country:     comp.country?.long_name ?? "",
            countryCode: comp.country?.short_name ?? "",
            stateCode:   comp.administrative_area_level_1?.short_name ?? "",
          };

          setInputValue(parsed.addressLine1);
          onPlaceSelect?.(parsed);
        });
      })
      .catch(() => {});

    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setInputValue(e.target.value);
    onChange?.(e);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={inputValue}
      onChange={handleChange}
      placeholder={placeholder}
      autoComplete="off"
      className="w-full border border-dashed border-[#E5E7EB] rounded-xl px-4 py-3 text-[15px] text-[#383838] placeholder:text-[#AEAEAE] focus:outline-none focus:border-[#EA3335]/60 transition-colors"
    />
  );
};

export default GooglePlacesInput;
