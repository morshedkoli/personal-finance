"use client";

import DashboardLayout from "@/components/DashboardLayout";

export default function PrivacyPolicy() {
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Privacy Policy</h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-4">
          <p>We value your privacy. This application does not share your personal information with third parties. All data is securely stored and only accessible to you. We use your information solely to provide and improve the service.</p>
          <p>We do not sell, trade, or rent your personal information to others. Your data is encrypted and protected using industry-standard security measures.</p>
          <p>By using this application, you consent to our privacy policy. If you have any questions, please contact us.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}