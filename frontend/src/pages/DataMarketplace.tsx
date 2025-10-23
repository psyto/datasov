import React, { useState } from "react";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { DataType } from "../types";
import { useDataListings } from "../hooks/useDataListings";
import DataListingCard from "../components/DataListingCard";
import LoadingSpinner from "../components/LoadingSpinner";
import apiService from "../services/api";
import toast from "react-hot-toast";

const DataMarketplace: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<DataType | "ALL">("ALL");
    const [sortBy, setSortBy] = useState<"price" | "date" | "popularity">(
        "date"
    );
    const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
        min: 0,
        max: 1000,
    });
    const [purchasingListingId, setPurchasingListingId] = useState<
        number | null
    >(null);

    const { listings, isLoading, refetch } = useDataListings();

    const handlePurchase = async (listingId: number) => {
        setPurchasingListingId(listingId);
        try {
            await apiService.purchaseData({
                buyer: "demo@datasov.com",
                listingId,
                tokenMint: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                cordaIdentityId: "ID_001",
            });
            toast.success("Data purchased successfully!");
            refetch(); // Refresh listings to show updated status
        } catch (error: any) {
            toast.error(error.message || "Failed to purchase data");
        } finally {
            setPurchasingListingId(null);
        }
    };

    const filteredListings =
        listings?.filter((listing) => {
            const matchesSearch =
                listing.description
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                listing.dataType
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());
            const matchesType =
                filterType === "ALL" || listing.dataType === filterType;
            const matchesPrice =
                parseFloat(listing.price) >= priceRange.min &&
                parseFloat(listing.price) <= priceRange.max;

            return matchesSearch && matchesType && matchesPrice;
        }) || [];

    const sortedListings = [...filteredListings].sort((a, b) => {
        switch (sortBy) {
            case "price":
                return parseFloat(a.price) - parseFloat(b.price);
            case "date":
                return b.createdAt - a.createdAt;
            case "popularity":
                // Mock popularity based on listing age and price
                return (
                    (b.createdAt - a.createdAt) / 1000 +
                    parseFloat(b.price) / 100
                );
            default:
                return 0;
        }
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" text="Loading marketplace..." />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Data Marketplace
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Discover and purchase verified data from trusted sources
                </p>
            </div>

            {/* Search and Filters */}
            <div className="card">
                <div className="card-body">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                        {/* Search */}
                        <div className="lg:col-span-2">
                            <label htmlFor="search" className="label">
                                Search data listings
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    id="search"
                                    className="input pl-10"
                                    placeholder="Search by description or data type..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        {/* Data Type Filter */}
                        <div>
                            <label htmlFor="type" className="label">
                                Data Type
                            </label>
                            <select
                                id="type"
                                className="input"
                                value={filterType}
                                onChange={(e) =>
                                    setFilterType(
                                        e.target.value as DataType | "ALL"
                                    )
                                }
                            >
                                <option value="ALL">All Types</option>
                                <option value={DataType.LOCATION_HISTORY}>
                                    Location History
                                </option>
                                <option value={DataType.APP_USAGE}>
                                    App Usage
                                </option>
                                <option value={DataType.PURCHASE_HISTORY}>
                                    Purchase History
                                </option>
                                <option value={DataType.HEALTH_DATA}>
                                    Health Data
                                </option>
                                <option value={DataType.SOCIAL_MEDIA_ACTIVITY}>
                                    Social Media
                                </option>
                                <option value={DataType.SEARCH_HISTORY}>
                                    Search History
                                </option>
                                <option value={DataType.FINANCIAL_DATA}>
                                    Financial Data
                                </option>
                                <option value={DataType.COMMUNICATION_DATA}>
                                    Communication
                                </option>
                                <option value={DataType.CUSTOM}>Custom</option>
                            </select>
                        </div>

                        {/* Sort */}
                        <div>
                            <label htmlFor="sort" className="label">
                                Sort by
                            </label>
                            <select
                                id="sort"
                                className="input"
                                value={sortBy}
                                onChange={(e) =>
                                    setSortBy(
                                        e.target.value as
                                            | "price"
                                            | "date"
                                            | "popularity"
                                    )
                                }
                            >
                                <option value="date">Newest First</option>
                                <option value="price">
                                    Price: Low to High
                                </option>
                                <option value="popularity">Most Popular</option>
                            </select>
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="mt-4">
                        <label className="label">Price Range (SOL)</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder="Min price"
                                    value={priceRange.min}
                                    onChange={(e) =>
                                        setPriceRange((prev) => ({
                                            ...prev,
                                            min:
                                                parseFloat(e.target.value) || 0,
                                        }))
                                    }
                                />
                            </div>
                            <div>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder="Max price"
                                    value={priceRange.max}
                                    onChange={(e) =>
                                        setPriceRange((prev) => ({
                                            ...prev,
                                            max:
                                                parseFloat(e.target.value) ||
                                                1000,
                                        }))
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Summary */}
            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                    Showing {sortedListings.length} of {listings?.length || 0}{" "}
                    listings
                </p>
                <button
                    onClick={() => refetch()}
                    className="text-sm text-primary-600 hover:text-primary-500"
                >
                    Refresh
                </button>
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {sortedListings.map((listing) => (
                    <DataListingCard
                        key={listing.id}
                        listing={listing}
                        onPurchase={handlePurchase}
                        isPurchasing={purchasingListingId === listing.id}
                    />
                ))}
            </div>

            {/* Empty State */}
            {sortedListings.length === 0 && (
                <div className="text-center py-12">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                        <svg
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No listings found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {searchTerm ||
                        filterType !== "ALL" ||
                        priceRange.min > 0 ||
                        priceRange.max < 1000
                            ? "Try adjusting your search criteria or filters."
                            : "No data listings are currently available in the marketplace."}
                    </p>
                </div>
            )}
        </div>
    );
};

export default DataMarketplace;
