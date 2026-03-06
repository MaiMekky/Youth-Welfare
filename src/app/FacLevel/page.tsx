"use client";

import React, { useState, useMemo } from "react";
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
        req.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.studentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(req.reqNumber)?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [selectedFilter, searchQuery, requests]);

  return (
    <div className="page-wrapper">
      
      <main className="main-content" style={{ width: "100%", maxWidth: "100%" }}>
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
          onDataFetched={setRequests}        // parent state setter — يستقبل RequestsTable البيانات ويخزنها في الأب
          filteredRequests={filteredRequests} // لعرض النتائج المفلترة فقط في الجدول
        />

      </main>
      <Footer />
    </div>
  );
}