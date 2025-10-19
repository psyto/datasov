import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { IdentityType, VerificationMethodType } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";

interface CreateIdentityModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface IdentityFormData {
    identityType: IdentityType;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    nationality: string;
    address: string;
    verificationMethod: VerificationMethodType;
}

const CreateIdentityModal: React.FC<CreateIdentityModalProps> = ({
    isOpen,
    onClose,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<IdentityFormData>({
        defaultValues: {
            identityType: IdentityType.NTT_DOCOMO_USER_ID,
            verificationMethod: VerificationMethodType.DOCUMENT_VERIFICATION,
        },
    });

    const onSubmit = async (data: IdentityFormData) => {
        setIsSubmitting(true);
        try {
            // Mock API call - replace with actual implementation
            await new Promise((resolve) => setTimeout(resolve, 2000));

            toast.success("Identity registration initiated successfully");
            reset();
            onClose();
        } catch (error) {
            toast.error("Failed to register identity");
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
                                    Register Digital Identity
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
                                Create a new verified digital identity for data
                                ownership
                            </p>
                        </div>

                        {/* Form */}
                        <div className="bg-white px-4 pb-4 sm:p-6 space-y-4">
                            {/* Identity Type */}
                            <div>
                                <label htmlFor="identityType" className="label">
                                    Identity Type
                                </label>
                                <select
                                    {...register("identityType", {
                                        required: "Identity type is required",
                                    })}
                                    className={`input ${
                                        errors.identityType ? "input-error" : ""
                                    }`}
                                >
                                    <option
                                        value={IdentityType.NTT_DOCOMO_USER_ID}
                                    >
                                        NTT DOCOMO User ID
                                    </option>
                                    <option
                                        value={
                                            IdentityType.GOVERNMENT_DIGITAL_ID
                                        }
                                    >
                                        Government Digital ID
                                    </option>
                                    <option value={IdentityType.PASSPORT}>
                                        Passport
                                    </option>
                                    <option
                                        value={IdentityType.DRIVERS_LICENSE}
                                    >
                                        Driver's License
                                    </option>
                                    <option value={IdentityType.NATIONAL_ID}>
                                        National ID
                                    </option>
                                    <option value={IdentityType.CUSTOM}>
                                        Custom
                                    </option>
                                </select>
                                {errors.identityType && (
                                    <p className="mt-1 text-sm text-error-600">
                                        {errors.identityType.message}
                                    </p>
                                )}
                            </div>

                            {/* Personal Information */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="firstName"
                                        className="label"
                                    >
                                        First Name
                                    </label>
                                    <input
                                        {...register("firstName", {
                                            required: "First name is required",
                                        })}
                                        type="text"
                                        className={`input ${
                                            errors.firstName
                                                ? "input-error"
                                                : ""
                                        }`}
                                        placeholder="Enter first name"
                                    />
                                    {errors.firstName && (
                                        <p className="mt-1 text-sm text-error-600">
                                            {errors.firstName.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="lastName" className="label">
                                        Last Name
                                    </label>
                                    <input
                                        {...register("lastName", {
                                            required: "Last name is required",
                                        })}
                                        type="text"
                                        className={`input ${
                                            errors.lastName ? "input-error" : ""
                                        }`}
                                        placeholder="Enter last name"
                                    />
                                    {errors.lastName && (
                                        <p className="mt-1 text-sm text-error-600">
                                            {errors.lastName.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="label">
                                    Email Address
                                </label>
                                <input
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address",
                                        },
                                    })}
                                    type="email"
                                    className={`input ${
                                        errors.email ? "input-error" : ""
                                    }`}
                                    placeholder="Enter email address"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-error-600">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="phoneNumber" className="label">
                                    Phone Number
                                </label>
                                <input
                                    {...register("phoneNumber")}
                                    type="tel"
                                    className="input"
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="dateOfBirth"
                                        className="label"
                                    >
                                        Date of Birth
                                    </label>
                                    <input
                                        {...register("dateOfBirth")}
                                        type="date"
                                        className="input"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="nationality"
                                        className="label"
                                    >
                                        Nationality
                                    </label>
                                    <input
                                        {...register("nationality")}
                                        type="text"
                                        className="input"
                                        placeholder="Enter nationality"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="address" className="label">
                                    Address
                                </label>
                                <textarea
                                    {...register("address")}
                                    rows={3}
                                    className="input"
                                    placeholder="Enter full address"
                                />
                            </div>

                            {/* Verification Method */}
                            <div>
                                <label
                                    htmlFor="verificationMethod"
                                    className="label"
                                >
                                    Verification Method
                                </label>
                                <select
                                    {...register("verificationMethod", {
                                        required:
                                            "Verification method is required",
                                    })}
                                    className={`input ${
                                        errors.verificationMethod
                                            ? "input-error"
                                            : ""
                                    }`}
                                >
                                    <option
                                        value={
                                            VerificationMethodType.DOCUMENT_VERIFICATION
                                        }
                                    >
                                        Document Verification
                                    </option>
                                    <option
                                        value={
                                            VerificationMethodType.BIOMETRIC_VERIFICATION
                                        }
                                    >
                                        Biometric Verification
                                    </option>
                                    <option
                                        value={
                                            VerificationMethodType.KNOWLEDGE_BASED_VERIFICATION
                                        }
                                    >
                                        Knowledge-Based Verification
                                    </option>
                                    <option
                                        value={
                                            VerificationMethodType.CREDENTIAL_VERIFICATION
                                        }
                                    >
                                        Credential Verification
                                    </option>
                                    <option
                                        value={
                                            VerificationMethodType.THIRD_PARTY_VERIFICATION
                                        }
                                    >
                                        Third-Party Verification
                                    </option>
                                    <option
                                        value={
                                            VerificationMethodType.SELF_ATTESTATION
                                        }
                                    >
                                        Self-Attestation
                                    </option>
                                </select>
                                {errors.verificationMethod && (
                                    <p className="mt-1 text-sm text-error-600">
                                        {errors.verificationMethod.message}
                                    </p>
                                )}
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
                                    "Register Identity"
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

export default CreateIdentityModal;
