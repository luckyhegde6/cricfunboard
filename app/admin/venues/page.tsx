"use client";

import { useEffect, useState } from "react";
import VenueModal from "@/components/admin/VenueModal";

interface Venue {
    _id: string;
    name: string;
    address?: string;
    city?: string;
    country?: string;
    capacity?: number;
    latitude?: number;
    longitude?: number;
}

export default function AdminVenuesPage() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [editVenue, setEditVenue] = useState<Venue | null>(null);
    const [showModal, setShowModal] = useState(false);

    function loadVenues() {
        setLoading(true);
        fetch("/api/venues")
            .then((res) => res.json())
            .then((data) => {
                setVenues(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }

    useEffect(() => {
        loadVenues();
    }, []);

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this venue?")) return;

        try {
            const res = await fetch(`/api/venues/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete venue");
            loadVenues();
        } catch (err) {
            console.error(err);
            alert("Failed to delete venue");
        }
    }

    if (loading) return <div className="p-6">Loading venues...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Venues</h1>
                <button
                    onClick={() => {
                        setEditVenue(null);
                        setShowModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Add Venue
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Location
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Capacity
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {venues.map((venue) => (
                            <tr key={venue._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {venue.name}
                                    </div>
                                    {venue.address && (
                                        <div className="text-xs text-gray-500">{venue.address}</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {venue.city && venue.country
                                        ? `${venue.city}, ${venue.country}`
                                        : venue.city || venue.country || "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {venue.capacity ? venue.capacity.toLocaleString() : "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                    <button
                                        onClick={() => {
                                            setEditVenue(venue);
                                            setShowModal(true);
                                        }}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(venue._id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <VenueModal
                    venue={editVenue}
                    onClose={() => {
                        setShowModal(false);
                        setEditVenue(null);
                    }}
                    onSave={() => {
                        setShowModal(false);
                        setEditVenue(null);
                        loadVenues();
                    }}
                />
            )}
        </div>
    );
}
