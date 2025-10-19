import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { DataType } from "../types";
import { useDataListings } from "../hooks/useDataListings";
import LoadingSpinner from "./LoadingSpinner";
import toast from "react-hot-toast";

interface CreateDataListingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

interface DataListingFormData {
    dataType: DataType;
    description: string;
    price: string;
    cordaIdentityId: string;
}

const CreateDataListingModal: React.FC<CreateDataListingModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { createListing } = useDataListings();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<DataListingFormData>({
        defaultValues: {
            dataType: DataType.LOCATION_HISTORY,
            price: "0.1",
        },
    });

    const onSubmit = async (data: DataListingFormData) => {
        setIsSubmitting(true);
        try {
            await createListing({
                owner: "current-user", // Replace with actual user ID
                listingId: Math.floor(Math.random() * 10000), // Generate unique ID
                price: data.price,
                dataType: data.dataType,
                description: data.description,
                cordaIdentityId: data.cordaIdentityId,
            });

            toast.success("Data listing created successfully");
            reset();
            onClose();
            onSuccess?.();
        } catch (error) {
            toast.error("Failed to create data listing");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            reset();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    onClick={handleClose}
                />

                {/* Modal panel */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Header */}
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Create Data Listing
                                </h3>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                    className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                                List your data for sale in the marketplace
                            </p>
                        </div>

                        {/* Form */}
                        <div className="bg-white px-4 pb-4 sm:p-6 space-y-4">
                            {/* Data Type */}
                            <div>
                                <label htmlFor="dataType" className="label">
                                    Data Type
                                </label>
                                <select
                                    {...register("dataType", {
                                        required: "Data type is required",
                                    })}
                                    className={`input ${
                                        errors.dataType ? "input-error" : ""
                                    }`}
                                >
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
                                    <option
                                        value={DataType.SOCIAL_MEDIA_ACTIVITY}
                                    >
                                        Social Media Activity
                                    </option>
                                    <option value={DataType.SEARCH_HISTORY}>
                                        Search History
                                    </option>
                                    <option value={DataType.FINANCIAL_DATA}>
                                        Financial Data
                                    </option>
                                    <option value={DataType.COMMUNICATION_DATA}>
                                        Communication Data
                                    </option>
                                    <option value={DataType.CUSTOM}>
                                        Custom
                                    </option>
                                </select>
                                {errors.dataType && (
                                    <p className="mt-1 text-sm text-error-600">
                                        {errors.dataType.message}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="label">
                                    Description
                                </label>
                                <textarea
                                    {...register("description", {
                                        required: "Description is required",
                                        minLength: {
                                            value: 10,
                                            message:
                                                "Description must be at least 10 characters",
                                        },
                                    })}
                                    rows={4}
                                    className={`input ${
                                        errors.description ? "input-error" : ""
                                    }`}
                                    placeholder="Describe your data in detail. What does it contain? How was it collected? What value does it provide?"
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-error-600">
                                        {errors.description.message}
                                    </p>
                                )}
                            </div>

                            {/* Price */}
                            <div>
                                <label htmlFor="price" className="label">
                                    Price (SOL)
                                </label>
                                <div className="relative">
                                    <input
                                        {...register("price", {
                                            required: "Price is required",
                                            pattern: {
                                                value: /^\d+(\.\d{1,9})?$/,
                                                message:
                                                    "Please enter a valid price",
                                            },
                                            min: {
                                                value: 0.001,
                                                message:
                                                    "Price must be at least 0.001 SOL",
                                            },
                                        })}
                                        type="number"
                                        step="0.001"
                                        min="0.001"
                                        className={`input pr-12 ${
                                            errors.price ? "input-error" : ""
                                        }`}
                                        placeholder="0.1"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 text-sm">
                                            SOL
                                        </span>
                                    </div>
                                </div>
                                {errors.price && (
                                    <p className="mt-1 text-sm text-error-600">
                                        {errors.price.message}
                                    </p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    Minimum price: 0.001 SOL. You'll receive
                                    97.5% after marketplace fees.
                                </p>
                            </div>

                            {/* Identity Selection */}
                            <div>
                                <label
                                    htmlFor="cordaIdentityId"
                                    className="label"
                                >
                                    Verified Identity
                                </label>
                                <select
                                    {...register("cordaIdentityId", {
                                        required: "Identity is required",
                                    })}
                                    className={`input ${
                                        errors.cordaIdentityId
                                            ? "input-error"
                                            : ""
                                    }`}
                                >
                                    <option value="">
                                        Select a verified identity
                                    </option>
                                    <option value="ID_001">
                                        Taro Yamada (NTT DOCOMO) - Verified
                                    </option>
                                    <option value="ID_002">
                                        Hanako Sato (Government ID) - Pending
                                    </option>
                                </select>
                                {errors.cordaIdentityId && (
                                    <p className="mt-1 text-sm text-error-600">
                                        {errors.cordaIdentityId.message}
                                    </p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    Only verified identities can be used for
                                    data listings.
                                </p>
                            </div>

                            {/* Terms and Conditions */}
                            <div className="flex items-start">
                                <input
                                    type="checkbox"
                                    required
                                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 text-sm text-gray-600">
                                    I agree to the{" "}
                                    <a
                                        href="#"
                                        className="text-primary-600 hover:text-primary-500"
                                    >
                                        Terms of Service
                                    </a>{" "}
                                    and{" "}
                                    <a
                                        href="#"
                                        className="text-primary-600 hover:text-primary-500"
                                    >
                                        Data Listing Agreement
                                    </a>
                                    . I confirm that I have the right to sell
                                    this data and that it has been collected
                                    legally.
                                </label>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <LoadingSpinner size="sm" />
                                ) : (
                                    "Create Listing"
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isSubmitting}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateDataListingModal;
