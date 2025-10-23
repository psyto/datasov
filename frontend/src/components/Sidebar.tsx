import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
    HomeIcon,
    IdentificationIcon,
    ShoppingBagIcon,
    CircleStackIcon,
    ChartBarIcon,
    CogIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../hooks/useAuth";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    { name: "Identities", href: "/identities", icon: IdentificationIcon },
    { name: "My Data", href: "/my-data", icon: CircleStackIcon },
    { name: "Marketplace", href: "/marketplace", icon: ShoppingBagIcon },
    { name: "Analytics", href: "/analytics", icon: ChartBarIcon },
    { name: "Settings", href: "/settings", icon: CogIcon },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { user } = useAuth();

    return (
        <>
            {/* Mobile sidebar overlay */}
            {isOpen && (
                <div className="fixed inset-0 flex z-40 md:hidden">
                    <div
                        className="fixed inset-0 bg-gray-600 bg-opacity-75"
                        onClick={onClose}
                    />
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <button
                                type="button"
                                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                onClick={onClose}
                            >
                                <XMarkIcon className="h-6 w-6 text-white" />
                            </button>
                        </div>
                        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                            <div className="flex-shrink-0 flex items-center px-4">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="h-8 w-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                                            <span className="text-white font-bold text-sm">
                                                DS
                                            </span>
                                        </div>
                                    </div>
                                    <div className="ml-3">
                                        <h1 className="text-lg font-semibold text-gray-900">
                                            DataSov
                                        </h1>
                                    </div>
                                </div>
                            </div>
                            <nav className="mt-5 px-2 space-y-1">
                                {navigation.map((item) => {
                                    const isActive =
                                        location.pathname === item.href;
                                    return (
                                        <NavLink
                                            key={item.name}
                                            to={item.href}
                                            className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                                                isActive
                                                    ? "bg-primary-100 text-primary-900"
                                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                            }`}
                                            onClick={onClose}
                                        >
                                            <item.icon
                                                className={`mr-4 flex-shrink-0 h-6 w-6 ${
                                                    isActive
                                                        ? "text-primary-500"
                                                        : "text-gray-400 group-hover:text-gray-500"
                                                }`}
                                            />
                                            {item.name}
                                        </NavLink>
                                    );
                                })}
                            </nav>
                        </div>
                        {user && (
                            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-medium text-gray-700">
                                                {user.name
                                                    ?.charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-base font-medium text-gray-700">
                                            {user.name}
                                        </p>
                                        <p className="text-sm font-medium text-gray-500">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Desktop sidebar */}
            <div className="hidden md:flex md:flex-shrink-0">
                <div className="flex flex-col w-64">
                    <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
                        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                            <div className="flex items-center flex-shrink-0 px-4">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="h-8 w-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                                            <span className="text-white font-bold text-sm">
                                                DS
                                            </span>
                                        </div>
                                    </div>
                                    <div className="ml-3">
                                        <h1 className="text-lg font-semibold text-gray-900">
                                            DataSov
                                        </h1>
                                    </div>
                                </div>
                            </div>
                            <nav className="mt-5 flex-1 px-2 space-y-1">
                                {navigation.map((item) => {
                                    const isActive =
                                        location.pathname === item.href;
                                    return (
                                        <NavLink
                                            key={item.name}
                                            to={item.href}
                                            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                                                isActive
                                                    ? "bg-primary-100 text-primary-900"
                                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                            }`}
                                        >
                                            <item.icon
                                                className={`mr-3 flex-shrink-0 h-6 w-6 ${
                                                    isActive
                                                        ? "text-primary-500"
                                                        : "text-gray-400 group-hover:text-gray-500"
                                                }`}
                                            />
                                            {item.name}
                                        </NavLink>
                                    );
                                })}
                            </nav>
                        </div>
                        {user && (
                            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-medium text-gray-700">
                                                {user.name
                                                    ?.charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-base font-medium text-gray-700">
                                            {user.name}
                                        </p>
                                        <p className="text-sm font-medium text-gray-500">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
