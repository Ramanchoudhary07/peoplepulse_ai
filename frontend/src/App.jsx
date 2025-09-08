import React from "react";
import { Toaster } from "react-hot-toast";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "./contexts/AuthContext";

// Import components
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./components/dashboard/Dashboard";
import Jobs from "./components/jobs/Jobs";
import CreateJob from "./components/jobs/CreateJob";
import JobDetails from "./components/jobs/JobDetails";
import EditJob from "./components/jobs/EditJob";
import ApplicationsManagement from "./components/onboarding/ApplicationsManagement";
import ApplyToJob from "./components/jobs/ApplyToJob";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes - No Authentication Required */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/apply/:id" element={<ApplyToJob />} />

            {/* Protected Routes - Authentication Required */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <Jobs />
                </ProtectedRoute>
              }
            />

            <Route
              path="/jobs/create"
              element={
                <ProtectedRoute>
                  <CreateJob />
                </ProtectedRoute>
              }
            />

            <Route
              path="/jobs/:id"
              element={
                <ProtectedRoute>
                  <JobDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/jobs/:id/edit"
              element={
                <ProtectedRoute>
                  <EditJob />
                </ProtectedRoute>
              }
            />

            <Route
              path="/jobs/:id/applications"
              element={
                <ProtectedRoute>
                  <ApplicationsManagement />
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Catch all other routes and redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
