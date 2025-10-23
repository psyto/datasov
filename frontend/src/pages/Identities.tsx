import React, { useState } from "react";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { IdentityType, IdentityStatus, VerificationLevel } from "../types";
import IdentityCard from "../components/IdentityCard";
import CreateIdentityModal from "../components/CreateIdentityModal";
import LoadingSpinner from "../components/LoadingSpinner";
import { useIdentities } from "../hooks/useIdentities";
import { useAuth } from "../hooks/useAuth";

const Identities: React.FC = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<IdentityStatus | "ALL">(
        "ALL"
    );
    const [filterType, setFilterType] = useState<IdentityType | "ALL">("ALL");

    const { user } = useAuth();
    const { identities, isLoading, createIdentity, isCreating } = useIdentities(
        user?.email
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    const filteredIdentities = identities.filter((identity) => {
        const matchesSearch =
            identity.identityId
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            identity.personalInfo.firstName
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            identity.personalInfo.lastName
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase());
        const matchesStatus =
            filterStatus === "ALL" || identity.status === filterStatus;
        const matchesType =
            filterType === "ALL" || identity.identityType === filterType;

        return matchesSearch && matchesStatus && matchesType;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Digital Identities
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage your verified digital identities
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Register Identity
                </button>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="card-body">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {/* Search */}
                        <div>
                            <label htmlFor="search" className="label">
                                Search identities
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    id="search"
                                    className="input pl-10"
                                    placeholder="Search by name or ID..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>
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
                                        e.target.value as IdentityStatus | "ALL"
                                    )
                                }
                            >
                                <option value="ALL">All Statuses</option>
                                <option value={IdentityStatus.PENDING}>
                                    Pending
                                </option>
                                <option value={IdentityStatus.VERIFIED}>
                                    Verified
                                </option>
                                <option value={IdentityStatus.REVOKED}>
                                    Revoked
                                </option>
                                <option value={IdentityStatus.SUSPENDED}>
                                    Suspended
                                </option>
                            </select>
                        </div>

                        {/* Type Filter */}
                        <div>
                            <label htmlFor="type" className="label">
                                Identity Type
                            </label>
                            <select
                                id="type"
                                className="input"
                                value={filterType}
                                onChange={(e) =>
                                    setFilterType(
                                        e.target.value as IdentityType | "ALL"
                                    )
                                }
                            >
                                <option value="ALL">All Types</option>
                                <option value={IdentityType.NTT_DOCOMO_USER_ID}>
                                    NTT DOCOMO
                                </option>
                                <option
                                    value={IdentityType.GOVERNMENT_DIGITAL_ID}
                                >
                                    Government ID
                                </option>
                                <option value={IdentityType.PASSPORT}>
                                    Passport
                                </option>
                                <option value={IdentityType.DRIVERS_LICENSE}>
                                    Driver's License
                                </option>
                                <option value={IdentityType.NATIONAL_ID}>
                                    National ID
                                </option>
                                <option value={IdentityType.CUSTOM}>
                                    Custom
                                </option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Identities Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredIdentities.map((identity) => (
                    <IdentityCard
                        key={identity.identityId}
                        identity={identity}
                    />
                ))}
            </div>

            {/* Empty State */}
            {filteredIdentities.length === 0 && (
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
                        No identities found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {searchTerm ||
                        filterStatus !== "ALL" ||
                        filterType !== "ALL"
                            ? "Try adjusting your search or filters."
                            : "Get started by registering your first digital identity."}
                    </p>
                    {!searchTerm &&
                        filterStatus === "ALL" &&
                        filterType === "ALL" && (
                            <div className="mt-6">
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="btn btn-primary"
                                >
                                    <PlusIcon className="h-5 w-5 mr-2" />
                                    Register Identity
                                </button>
                            </div>
                        )}
                </div>
            )}

            {/* Create Identity Modal */}
            {showCreateModal && (
                <CreateIdentityModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onCreateIdentity={createIdentity}
                    isCreating={isCreating}
                />
            )}
        </div>
    );
};

export default Identities;
