import React, { Fragment, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
    UserIcon,
    CogIcon,
    ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../hooks/useAuth";

interface UserMenuProps {
    user: any;
}

const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
    const { logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
    };

    return (
        <Menu as="div" className="ml-3 relative">
            <div>
                <Menu.Button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                            {user?.name?.charAt(0).toUpperCase() || "U"}
                        </span>
                    </div>
                </Menu.Button>
            </div>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                            {user?.name}
                        </p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>

                    <Menu.Item>
                        {({ active }) => (
                            <a
                                href="/settings"
                                className={`${
                                    active ? "bg-gray-100" : ""
                                } group flex items-center px-4 py-2 text-sm text-gray-700`}
                            >
                                <UserIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                                Your Profile
                            </a>
                        )}
                    </Menu.Item>

                    <Menu.Item>
                        {({ active }) => (
                            <a
                                href="/settings"
                                className={`${
                                    active ? "bg-gray-100" : ""
                                } group flex items-center px-4 py-2 text-sm text-gray-700`}
                            >
                                <CogIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                                Settings
                            </a>
                        )}
                    </Menu.Item>

                    <Menu.Item>
                        {({ active }) => (
                            <button
                                onClick={handleLogout}
                                className={`${
                                    active ? "bg-gray-100" : ""
                                } group flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                            >
                                <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                                Sign out
                            </button>
                        )}
                    </Menu.Item>
                </Menu.Items>
            </Transition>
        </Menu>
    );
};

export default UserMenu;
