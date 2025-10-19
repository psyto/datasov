import React, { useState } from "react";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { DataType } from "../types";
import { useDataListings } from "../hooks/useDataListings";
import DataListingCard from "../components/DataListingCard";
import CreateDataListingModal from "../components/CreateDataListingModal";
import LoadingSpinner from "../components/LoadingSpinner";

const MyData: React.FC = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<DataType | "ALL">("ALL");
    const [filterStatus, setFilterStatus] = useState<
        "ALL" | "ACTIVE" | "SOLD" | "CANCELLED"
    >("ALL");

    // Get user's data listings
    const { listings, isLoading, refetch } = useDataListings({
        owner: "current-user",
    });

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

            let matchesStatus = true;
            if (filterStatus === "ACTIVE") {
                matchesStatus = listing.isActive && !listing.soldAt;
            } else if (filterStatus === "SOLD") {
                matchesStatus = !!listing.soldAt;
            } else if (filterStatus === "CANCELLED") {
                matchesStatus = !!listing.cancelledAt;
            }

            return matchesSearch && matchesType && matchesStatus;
        }) || [];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" text="Loading your data..." />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        My Data
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage your data listings and track earnings
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    List New Data
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="card">
                    <div className="card-body">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
                                    <span className="text-primary-600 font-semibold text-sm">
                                        A
                                    </span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">
                                    Active Listings
                                </p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {listings?.filter(
                                        (l) => l.isActive && !l.soldAt
                                    ).length || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-8 w-8 bg-success-100 rounded-lg flex items-center justify-center">
                                    <span className="text-success-600 font-semibold text-sm">
                                        S
                                    </span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">
                                    Sold Items
                                </p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {listings?.filter((l) => l.soldAt).length ||
                                        0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-8 w-8 bg-warning-100 rounded-lg flex items-center justify-center">
                                    <span className="text-warning-600 font-semibold text-sm">
                                        E
                                    </span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">
                                    Total Earnings
                                </p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {listings
                                        ?.reduce(
                                            (sum, l) =>
                                                sum +
                                                (l.soldAt
                                                    ? parseFloat(l.price)
                                                    : 0),
                                            0
                                        )
                                        .toFixed(2)}{" "}
                                    SOL
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-8 w-8 bg-secondary-100 rounded-lg flex items-center justify-center">
                                    <span className="text-secondary-600 font-semibold text-sm">
                                        V
                                    </span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">
                                    Views
                                </p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    1,234
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="card-body">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {/* Search */}
                        <div>
                            <label htmlFor="search" className="label">
                                Search listings
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    id="search"
                                    className="input pl-10"
                                    placeholder="Search by description..."
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

                        {/* Status Filter */}
                        <div>
                            <label htmlFor="status" className="label">
                                Status
                            </label>
                            <select
                                id="status"
                                className="input"
                                value={filterStatus}
                                onChange={(e) =>
                                    setFilterStatus(
                                        e.target.value as
                                            | "ALL"
                                            | "ACTIVE"
                                            | "SOLD"
                                            | "CANCELLED"
                                    )
                                }
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="ACTIVE">Active</option>
                                <option value="SOLD">Sold</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredListings.map((listing) => (
                    <DataListingCard
                        key={listing.id}
                        listing={listing}
                        showActions={true}
                        onEdit={() => {
                            /* Handle edit */
                        }}
                        onCancel={() => {
                            /* Handle cancel */
                        }}
                    />
                ))}
            </div>

            {/* Empty State */}
            {filteredListings.length === 0 && (
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
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No data listings found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {searchTerm ||
                        filterType !== "ALL" ||
                        filterStatus !== "ALL"
                            ? "Try adjusting your search or filters."
                            : "Start monetizing your data by creating your first listing."}
                    </p>
                    {!searchTerm &&
                        filterType === "ALL" &&
                        filterStatus === "ALL" && (
                            <div className="mt-6">
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="btn btn-primary"
                                >
                                    <PlusIcon className="h-5 w-5 mr-2" />
                                    Create First Listing
                                </button>
                            </div>
                        )}
                </div>
            )}

            {/* Create Listing Modal */}
            {showCreateModal && (
                <CreateDataListingModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        refetch();
                    }}
                />
            )}
        </div>
    );
};

export default MyData;
