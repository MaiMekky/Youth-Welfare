"use client";

import React, { useState } from "react";
import Header from "./components/Header";
import PageTitleSection from "./components/PageTitleSection";
import StatsGrid from "./components/StatsGrid";
import FiltersSection from "./components/FiltersSection";
import RequestsTable from "./components/RequestsTable";
import Footer from "./components/Footer";
import { FileText, AlertCircle, Clock, CheckCircle } from "lucide-react";
import DiscountsSection from "./components/DiscountsSection";

export default function FinancialSupportPage() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const requests = [
    {
      id: 1,
      name: "أحمد محمد علي",
      studentId: "ST-ENG-001",
      reqNumber: "REQ001",
      amount: "1,500",
      date: "2024/12/10",
      status: "received",
      statusText: "في الانتظار",
      actions: ["rejected", "approved", "details"],
    },
    {
      id: 2,
      name: "عمر فراج إبراهيم",
      studentId: "ST-ENG-002",
      reqNumber: "REQ002",
      amount: "1,200",
      date: "2024/12/09",
      status: "review",
      statusText: "قيد المراجعة",
      actions: ["rejected", "approved", "details"],
    },
    {
      id: 3,
      name: "يوسف إبراهيم أحمد",
      studentId: "ST-ENG-003",
      reqNumber: "REQ003",
      amount: "1,800",
      date: "2024/12/09",
      status: "approved",
      statusText: "تم الموافقة",
      actions: ["details"],
    },
    {
      id: 4,
      name: "سارة خالد حسن",
      studentId: "ST-ENG-004",
      reqNumber: "REQ004",
      amount: "1,000",
      date: "2024/12/05",
      status: "received",
      statusText: "تم الاستلام",
      actions: ["details"],
    },
    {
      id: 5,
      name: "محمد أشرف عبد الله",
      studentId: "ST-ENG-005",
      reqNumber: "REQ005",
      amount: "900",
      date: "2024/12/01",
      status: "rejected",
      statusText: "مرفوض",
      actions: ["details"],
    },
  ];

  const stats = [
    { icon: FileText, label: "إجمالي الطلبات", value: "8", color: "stat-total" },
    { icon: AlertCircle, label: "في الانتظار", value: "5", color: "stat-pending" },
    { icon: Clock, label: "قيد المراجعة", value: "2", color: "stat-review" },
    { icon: CheckCircle, label: "تم الموافقة", value: "1", color: "stat-approved" },
  ];

  // ✅ فلترة الطلبات حسب الحالة أو البحث
  const filteredRequests = requests.filter((req) => {
    const matchFilter =
      selectedFilter === "all" || req.status === selectedFilter;
    const matchSearch =
      req.name.includes(searchQuery) ||
      req.studentId.includes(searchQuery) ||
      req.reqNumber.includes(searchQuery);
    return matchFilter && matchSearch;
  });

  return (
    <div className="page-wrapper">
      <Header />
      <main className="main-content">
        <PageTitleSection />
        <StatsGrid />
        <DiscountsSection />

        {/* ✅ قسم الفلترة */}
        <FiltersSection
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* ✅ جدول الطلبات بعد الفلترة */}
        <RequestsTable requests={filteredRequests} />
      </main>
      <Footer />
    </div>
  );
}
