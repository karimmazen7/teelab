import { useState } from "react";

export default function LocationPicker({ location, onChange }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Your browser does not support location.");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        onChange({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
        });
        setLoading(false);
      },
      () => {
        setError("Location permission was denied or unavailable.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const mapsUrl =
    location.latitude && location.longitude
      ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
      : null;

  return (
    <div>
      <button
        type="button"
        onClick={getLocation}
        disabled={loading}
        className="w-full border border-black px-5 py-4 font-semibold disabled:opacity-50"
      >
        {loading ? "Getting location..." : "Use My Current Location"}
      </button>

      {mapsUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 block text-sm font-semibold underline"
        >
          Open captured location in Google Maps
        </a>
      )}

      {location.accuracy && (
        <p className="mt-2 text-sm text-neutral-500">
          Accuracy: approximately {Math.round(location.accuracy)} meters
        </p>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
