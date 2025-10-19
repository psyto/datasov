import React from "react";
import {
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { DigitalIdentity, IdentityStatus, VerificationLevel } from "@/types";
import { format } from "date-fns";

interface IdentityCardProps {
    identity: DigitalIdentity;
}

const IdentityCard: React.FC<IdentityCardProps> = ({ identity }) => {
    const getStatusIcon = (status: IdentityStatus) => {
        switch (status) {
            case IdentityStatus.VERIFIED:
                return <CheckCircleIcon className="h-5 w-5 text-success-500" />;
            case IdentityStatus.PENDING:
                return <ClockIcon className="h-5 w-5 text-warning-500" />;
            case IdentityStatus.REVOKED:
                return <XCircleIcon className="h-5 w-5 text-error-500" />;
            case IdentityStatus.SUSPENDED:
                return (
                    <ExclamationTriangleIcon className="h-5 w-5 text-warning-500" />
                );
            default:
                return <ClockIcon className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: IdentityStatus) => {
        switch (status) {
            case IdentityStatus.VERIFIED:
                return "text-success-600 bg-success-100";
            case IdentityStatus.PENDING:
                return "text-warning-600 bg-warning-100";
            case IdentityStatus.REVOKED:
                return "text-error-600 bg-error-100";
            case IdentityStatus.SUSPENDED:
                return "text-warning-600 bg-warning-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    const getVerificationLevelColor = (level: VerificationLevel) => {
        switch (level) {
            case VerificationLevel.HIGH:
            case VerificationLevel.CREDENTIAL:
                return "text-success-600 bg-success-100";
            case VerificationLevel.ENHANCED:
                return "text-primary-600 bg-primary-100";
            case VerificationLevel.BASIC:
                return "text-warning-600 bg-warning-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    return (
        <div className="card hover:shadow-md transition-shadow duration-200">
            <div className="card-body">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                            {identity.personalInfo.firstName}{" "}
                            {identity.personalInfo.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {identity.identityId}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        {getStatusIcon(identity.status)}
                        <span
                            className={`badge ${getStatusColor(
                                identity.status
                            )}`}
                        >
                            {identity.status.toLowerCase()}
                        </span>
                    </div>
                </div>

                {/* Identity Details */}
                <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Provider</span>
                        <span className="text-sm font-medium text-gray-900">
                            {identity.identityProvider}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Type</span>
                        <span className="text-sm font-medium text-gray-900">
                            {identity.identityType.replace(/_/g, " ")}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                            Verification
                        </span>
                        <span
                            className={`badge ${getVerificationLevelColor(
                                identity.verificationLevel
                            )}`}
                        >
                            {identity.verificationLevel.toLowerCase()}
                        </span>
                    </div>

                    {identity.emailAddress && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Email</span>
                            <span className="text-sm font-medium text-gray-900">
                                {identity.emailAddress}
                            </span>
                        </div>
                    )}
                </div>

                {/* Timestamps */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Created</span>
                        <span>
                            {format(
                                new Date(identity.createdAt),
                                "MMM d, yyyy"
                            )}
                        </span>
                    </div>
                    {identity.verifiedAt && (
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                            <span>Verified</span>
                            <span>
                                {format(
                                    new Date(identity.verifiedAt),
                                    "MMM d, yyyy"
                                )}
                            </span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-4 flex space-x-2">
                    <button className="flex-1 btn btn-outline text-sm">
                        View Details
                    </button>
                    {identity.status === IdentityStatus.VERIFIED && (
                        <button className="flex-1 btn btn-primary text-sm">
                            Use for Listing
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IdentityCard;
