"use client";

import React, { useState, useMemo } from "react";
import Header from "./components/Header";
import PageTitleSection from "./components/PageTitleSection";
import StatsGrid from "./components/StatsGrid";
import FiltersSection from "./components/FiltersSection";
import RequestsTable from "./components/RequestsTable";
import Footer from "./components/Footer";
import DiscountsSection from "./components/DiscountsSection";

export default function FinancialSupportPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // فلترة الطلبات للجدول فقط
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchFilter = selectedFilter === "all" || req.status === selectedFilter;
      const matchSearch =
        req.name.includes(searchQuery) ||
        req.studentId.includes(searchQuery) ||
        req.reqNumber.includes(searchQuery);
      return matchFilter && matchSearch;
    });
  }, [selectedFilter, searchQuery, requests]);

  return (
    <div className="page-wrapper">
      <Header />
      <main className="main-content">
        <PageTitleSection />

        {/* StatsGrid تاخد كل البيانات الأصلية */}
        <StatsGrid requests={requests} />

        <DiscountsSection />

        {/* الفلاتر */}
        <FiltersSection
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* جدول الطلبات بعد الفلترة */}
        <RequestsTable
          onDataFetched={setRequests}
          filteredRequests={filteredRequests}
        />

      </main>
      <Footer />
    </div>
  );
}
