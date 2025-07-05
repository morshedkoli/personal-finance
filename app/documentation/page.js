"use client";

import DashboardLayout from "@/components/DashboardLayout";

export default function Documentation() {
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">ডকুমেন্টেশন (Documentation)</h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-4 text-gray-900 dark:text-gray-100">
          <h2 className="text-xl font-semibold mb-2">ব্যবহার নির্দেশিকা</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>ড্যাশবোর্ডে আপনার মোট আয়, ব্যয়, পাওনা ও দেনা দেখতে পারবেন।</li>
            <li>Income, Expenses, Payables, Receivables মেনু থেকে নতুন তথ্য যোগ, সম্পাদনা ও মুছে ফেলতে পারবেন।</li>
            <li>History পেজে সকল লেনদেন ও পরিবর্তনের ইতিহাস দেখতে পারবেন।</li>
            <li>Settings পেজ থেকে অ্যাপের সেটিংস কাস্টমাইজ করতে পারবেন।</li>
            <li>Profile পেজে আপনার নাম ও ইমেইল পরিবর্তন করতে পারবেন (যদি সক্রিয় থাকে)।</li>
            <li>Sidebar থেকে দ্রুত নেভিগেট করতে পারবেন।</li>
            <li>ডার্ক ও লাইট থিম টগল করতে পারবেন উপরের ডান পাশে।</li>
            <li>নিরাপত্তার জন্য Logout করতে ভুলবেন না।</li>
          </ul>
          <h2 className="text-xl font-semibold mt-6 mb-2">সহায়তা</h2>
          <p>কোনো সমস্যা বা প্রশ্ন থাকলে ডেভেলপার এর সাথে যোগাযোগ করুন।</p>
        </div>
      </div>
    </DashboardLayout>
  );
}