import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import axios from "axios";

import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ForcePasswordChange from "./pages/ForcePasswordChange";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Staff from "./pages/Staff";
import Programs from "./pages/Programs";
import Graduates from "./pages/Graduates";
import Facilities from "./pages/Facilities";
import Reports from "./pages/Reports";
import Innovation from "./pages/Innovation";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/DashboardLayout";
import Faculties from "./pages/Faculties";
import EnrolmentSupport from "./pages/EnrolmentSupport";
import InstitutionalFinance from "./pages/InstitutionalFinance";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/force-password-change"
            element={<ForcePasswordChange />}
          />

          {/* Dashboard routes wrapped with DashboardLayout */}
          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/students"
            element={
              <DashboardLayout>
                <Students />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/staff"
            element={
              <DashboardLayout>
                <Staff />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/fees"
            element={
              <DashboardLayout>
                <InstitutionalFinance />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/programs"
            element={
              <DashboardLayout>
                <Programs />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/graduates"
            element={
              <DashboardLayout>
                <Graduates />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/special-enrollment"
            element={
              <DashboardLayout>
                <EnrolmentSupport />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/facilities"
            element={
              <DashboardLayout>
                <Facilities />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/faculties"
            element={
              <DashboardLayout>
                <Faculties />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/reports"
            element={
              <DashboardLayout>
                <Reports />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/innovation"
            element={
              <DashboardLayout>
                <Innovation />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
