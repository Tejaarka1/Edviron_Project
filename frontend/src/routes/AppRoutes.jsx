import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Transactions from "../pages/Transactions";
import TransactionDetails from "../pages/TransactionDetails";
import SchoolTransactions from "../pages/SchoolTransactions";
import StatusCheck from "../pages/StatusCheck";
import Layout from "../components/Layout";
import Reports from "../pages/Reports";
import Settingss from "../pages/Settingss";
import { Settings } from "lucide-react";

// Simple protected route wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/" element={<Login />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Layout>
              <Reports />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <Settingss />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Transactions Overview */}
      <Route
        path="/dashboard/transactions"
        element={
          <ProtectedRoute>
            <Layout>
              <Transactions />
            </Layout>
          </ProtectedRoute>
        }
      />
      {/* Transaction Details */}
      <Route
        path="/dashboard/transactions/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <TransactionDetails />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Sub-pages under Transactions */}
      <Route
        path="/dashboard/transactions/school"
        element={
          <ProtectedRoute>
            <Layout>
              <SchoolTransactions />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/transactions/status"
        element={
          <ProtectedRoute>
            <Layout>
              <StatusCheck />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
