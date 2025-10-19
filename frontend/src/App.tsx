import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";

// Pages
import Dashboard from "@/pages/Dashboard";
import Identities from "@/pages/Identities";
import DataMarketplace from "@/pages/DataMarketplace";
import MyData from "@/pages/MyData";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

const App: React.FC = () => {
    return (
        <div className="App">
            <Routes>
                {/* Public Routes */}
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <PublicRoute>
                            <Register />
                        </PublicRoute>
                    }
                />

                {/* Protected Routes */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route
                        index
                        element={<Navigate to="/dashboard" replace />}
                    />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="identities" element={<Identities />} />
                    <Route path="marketplace" element={<DataMarketplace />} />
                    <Route path="my-data" element={<MyData />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="settings" element={<Settings />} />
                </Route>

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    );
};

export default App;
