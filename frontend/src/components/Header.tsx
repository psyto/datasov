import React, { useState } from "react";
import {
    Bars3Icon,
    BellIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../hooks/useAuth";
import { useSystemHealth } from "../hooks/useSystemHealth";
import SystemStatus from "./SystemStatus";
import UserMenu from "./UserMenu";

interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const { user } = useAuth();
    const { data: health } = useSystemHealth();
    const [showSystemStatus, setShowSystemStatus] = useState(false);

    return (
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
            <button
                type="button"
                className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
                onClick={onMenuClick}
            >
                <Bars3Icon className="h-6 w-6" />
            </button>

            <div className="flex-1 px-4 flex justify-between">
                <div className="flex-1 flex">
                    <form
                        className="w-full flex md:ml-0"
                        action="#"
                        method="GET"
                    >
                        <label htmlFor="search-field" className="sr-only">
                            Search
                        </label>
                        <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                            <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5" />
                            </div>
                            <input
                                id="search-field"
                                className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
                                placeholder="Search identities, data listings..."
                                type="search"
                                name="search"
                            />
                        </div>
                    </form>
                </div>

                <div className="ml-4 flex items-center md:ml-6">
                    {/* System Status */}
                    <button
                        type="button"
                        className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        onClick={() => setShowSystemStatus(!showSystemStatus)}
                    >
                        <span className="sr-only">View system status</span>
                        <div
                            className={`h-2 w-2 rounded-full ${
                                health?.status === "healthy"
                                    ? "bg-green-400"
                                    : health?.status === "degraded"
                                    ? "bg-yellow-400"
                                    : "bg-red-400"
                            }`}
                        />
                    </button>

                    {/* Notifications */}
                    <button
                        type="button"
                        className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <span className="sr-only">View notifications</span>
                        <BellIcon className="h-6 w-6" />
                    </button>

                    {/* User menu */}
                    <UserMenu user={user} />
                </div>
            </div>

            {/* System Status Dropdown */}
            {showSystemStatus && (
                <div className="absolute right-0 top-16 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <SystemStatus />
                </div>
            )}
        </div>
    );
};

export default Header;
