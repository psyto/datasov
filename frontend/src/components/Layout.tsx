import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "@/hooks/useAuth";

const Layout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="h-screen flex overflow-hidden bg-gray-50">
            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main content */}
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                {/* Header */}
                <Header onMenuClick={() => setSidebarOpen(true)} />

                {/* Page content */}
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
