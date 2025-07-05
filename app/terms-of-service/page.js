"use client";

import DashboardLayout from "@/components/DashboardLayout";

export default function TermsOfService() {
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Terms of Service</h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-4">
          <p>By using this application, you agree to use it responsibly and not for any unlawful purpose. The application is provided as-is, without warranty of any kind.</p>
          <p>We reserve the right to update or change these terms at any time. Continued use of the application after changes constitutes acceptance of those changes.</p>
          <p>If you do not agree with any part of these terms, please discontinue use of the application.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}