import React from "react";
import {
    CurrencyDollarIcon,
    ClockIcon,
    EyeIcon,
    PencilIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { DataListing, DataType } from "@/types";
import { format } from "date-fns";

interface DataListingCardProps {
    listing: DataListing;
    showActions?: boolean;
    onEdit?: () => void;
    onCancel?: () => void;
}

const DataListingCard: React.FC<DataListingCardProps> = ({
    listing,
    showActions = false,
    onEdit,
    onCancel,
}) => {
    const getDataTypeIcon = (type: DataType) => {
        // Return appropriate icon based on data type
        return <CurrencyDollarIcon className="h-5 w-5" />;
    };

    const getDataTypeColor = (type: DataType) => {
        switch (type) {
            case DataType.LOCATION_HISTORY:
                return "text-blue-600 bg-blue-100";
            case DataType.HEALTH_DATA:
                return "text-green-600 bg-green-100";
            case DataType.FINANCIAL_DATA:
                return "text-yellow-600 bg-yellow-100";
            case DataType.SOCIAL_MEDIA_ACTIVITY:
                return "text-purple-600 bg-purple-100";
            case DataType.APP_USAGE:
                return "text-indigo-600 bg-indigo-100";
            case DataType.PURCHASE_HISTORY:
                return "text-pink-600 bg-pink-100";
            case DataType.SEARCH_HISTORY:
                return "text-gray-600 bg-gray-100";
            case DataType.COMMUNICATION_DATA:
                return "text-red-600 bg-red-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    const getStatusBadge = () => {
        if (listing.soldAt) {
            return <span className="badge badge-success">Sold</span>;
        } else if (listing.cancelledAt) {
            return <span className="badge badge-error">Cancelled</span>;
        } else if (listing.isActive) {
            return <span className="badge badge-primary">Active</span>;
        } else {
            return <span className="badge badge-gray">Inactive</span>;
        }
    };

    return (
        <div className="card hover:shadow-md transition-shadow duration-200">
            <div className="card-body">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center space-x-2">
                            {getDataTypeIcon(listing.dataType)}
                            <span
                                className={`badge ${getDataTypeColor(
                                    listing.dataType
                                )}`}
                            >
                                {listing.dataType.replace(/_/g, " ")}
                            </span>
                            {getStatusBadge()}
                        </div>
                        <h3 className="mt-2 text-lg font-medium text-gray-900 line-clamp-2">
                            {listing.description}
                        </h3>
                    </div>
                </div>

                {/* Price and Stats */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center text-sm text-gray-500">
                            <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                            <span className="font-medium text-gray-900">
                                {listing.price} SOL
                            </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            <span>1,234 views</span>
                        </div>
                    </div>
                </div>

                {/* Timestamps */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Listed</span>
                        <span>
                            {format(new Date(listing.createdAt), "MMM d, yyyy")}
                        </span>
                    </div>
                    {listing.soldAt && (
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                            <span>Sold</span>
                            <span>
                                {format(
                                    new Date(listing.soldAt),
                                    "MMM d, yyyy"
                                )}
                            </span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                {showActions && (
                    <div className="mt-4 flex space-x-2">
                        {listing.isActive && !listing.soldAt && (
                            <>
                                <button
                                    onClick={onEdit}
                                    className="flex-1 btn btn-outline text-sm"
                                >
                                    <PencilIcon className="h-4 w-4 mr-1" />
                                    Edit
                                </button>
                                <button
                                    onClick={onCancel}
                                    className="flex-1 btn btn-error text-sm"
                                >
                                    <XMarkIcon className="h-4 w-4 mr-1" />
                                    Cancel
                                </button>
                            </>
                        )}
                        {!listing.isActive && !listing.soldAt && (
                            <button className="flex-1 btn btn-primary text-sm">
                                Reactivate
                            </button>
                        )}
                        {listing.soldAt && (
                            <button className="flex-1 btn btn-outline text-sm">
                                View Sale Details
                            </button>
                        )}
                    </div>
                )}

                {/* Purchase Button for Marketplace */}
                {!showActions && listing.isActive && !listing.soldAt && (
                    <div className="mt-4">
                        <button className="w-full btn btn-primary">
                            <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                            Purchase Data
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataListingCard;
