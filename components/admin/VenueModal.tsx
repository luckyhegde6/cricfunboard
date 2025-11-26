"use client";

import { useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

interface VenueModalProps {
    venue?: any;
    onClose: () => void;
    onSave: () => void;
}

const mapContainerStyle = {
    width: "100%",
    height: "300px",
};

const defaultCenter = {
    lat: 12.9716, // Bangalore center
    lng: 77.5946,
};

export default function VenueModal({
    venue,
    onClose,
    onSave,
}: VenueModalProps) {
    const [name, setName] = useState(venue?.name || "");
    const [address, setAddress] = useState(venue?.address || "");
    const [city, setCity] = useState(venue?.city || "");
    const [country, setCountry] = useState(venue?.country || "");
    const [capacity, setCapacity] = useState(venue?.capacity || "");
    const [latitude, setLatitude] = useState(venue?.latitude || defaultCenter.lat);
    const [longitude, setLongitude] = useState(
        venue?.longitude || defaultCenter.lng,
    );
    const [busy, setBusy] = useState(false);

    // Get API key from environment variable
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setBusy(true);

        try {
            const url = venue ? `/api/venues/${venue._id}` : "/api/venues";
            const method = venue ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    address,
                    city,
                    country,
                    capacity: capacity ? Number(capacity) : undefined,
                    latitude,
                    longitude,
                }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("API Error:", errorText);
                throw new Error("Failed to save venue");
            }

            onSave();
        } catch (err) {
            console.error(err);
            alert("Failed to save venue");
        } finally {
            setBusy(false);
        }
    }

    function handleMapClick(e: google.maps.MapMouseEvent) {
        if (e.latLng) {
            setLatitude(e.latLng.lat());
            setLongitude(e.latLng.lng());
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 my-8">
                <h2 className="text-xl font-bold mb-4">
                    {venue ? "Edit Venue" : "Add New Venue"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Venue Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                City
                            </label>
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Country
                            </label>
                            <input
                                type="text"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Address
                        </label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            placeholder="Full address"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Capacity
                        </label>
                        <input
                            type="number"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            placeholder="Seating capacity"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location (Click on map to set)
                        </label>
                        {apiKey ? (
                            <LoadScript
                                googleMapsApiKey={apiKey}
                                onError={(error) => {
                                    console.error("Google Maps failed to load:", error);
                                }}
                            >
                                <GoogleMap
                                    mapContainerStyle={mapContainerStyle}
                                    center={{ lat: latitude, lng: longitude }}
                                    zoom={10}
                                    onClick={handleMapClick}
                                    onLoad={() => console.log("Google Maps loaded successfully")}
                                >
                                    <Marker position={{ lat: latitude, lng: longitude }} />
                                </GoogleMap>
                            </LoadScript>
                        ) : (
                            <div className="bg-gray-100 p-4 rounded border border-gray-300">
                                <p className="text-sm text-gray-600 mb-3">
                                    <strong>Google Maps API key not configured.</strong>
                                </p>
                                <p className="text-xs text-gray-500 mb-3">
                                    To enable map selection, add{" "}
                                    <code className="bg-gray-200 px-1 rounded">
                                        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                                    </code>{" "}
                                    to your{" "}
                                    <code className="bg-gray-200 px-1 rounded">.env.local</code>{" "}
                                    file.
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">
                                            Latitude
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={latitude}
                                            onChange={(e) => setLatitude(Number(e.target.value))}
                                            className="block w-full rounded border p-1 text-sm"
                                            placeholder="12.9716"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">
                                            Longitude
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={longitude}
                                            onChange={(e) => setLongitude(Number(e.target.value))}
                                            className="block w-full rounded border p-1 text-sm"
                                            placeholder="77.5946"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Current: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={busy}
                            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {busy ? "Saving..." : "Save Venue"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
