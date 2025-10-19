import React from "react";
import { Link } from "react-router-dom";
import { HomeIcon } from "@heroicons/react/24/outline";

const NotFound: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full text-center">
                <div className="mx-auto h-24 w-24 text-gray-400">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                </div>

                <h1 className="mt-6 text-6xl font-bold text-gray-900">404</h1>
                <h2 className="mt-2 text-2xl font-semibold text-gray-700">
                    Page not found
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                    Sorry, we couldn't find the page you're looking for.
                </p>

                <div className="mt-8">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <HomeIcon className="h-5 w-5 mr-2" />
                        Go back home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
