"use client";
import { useState } from "react";
import Head from "next/head";
import PageHeader from "./components/PageHeader";
import SummaryCard from "./components/SummaryCard";
import ApplicationsTable from "./components/ApplicationsTable";
import Layout from "./Layout";
import "./ApplicationsPage.css";

interface Application {
  amount: string;
  status: string;
}

export default function ApplicationsPage() {
  const [summaryData, setSummaryData] = useState({
    totalRequests: 0,
    totalAmount: "0 ج.م",
    pending: 0,
    accepted: 0,
    rejected: 0,
  });

  const handleDataLoaded = (apps: Application[]) => {
    const totalRequests = apps.length;

    const totalAmount = apps.reduce((sum, app) => {
      const cleaned = app.amount.replace(/[^\d.-]/g, "").replace(/,/g, "");
      const value = parseFloat(cleaned) || 0;
      return sum + value;
    }, 0);

    const pending  = apps.filter((a) => a.status === "منتظر").length;
    const accepted = apps.filter((a) => a.status === "مقبول").length;
    const rejected = apps.filter((a) => a.status === "مرفوض").length;

    setSummaryData({
      totalRequests,
      totalAmount: totalAmount.toLocaleString("en-US") + " ج.م",
      pending,
      accepted,
      rejected,
    });
  };

  return (
    <Layout>
      <div className="applications-container">
        <PageHeader />

        <SummaryCard
          totalRequests={summaryData.totalRequests}
          totalAmount={summaryData.totalAmount}
          pending={summaryData.pending}
          accepted={summaryData.accepted}
          rejected={summaryData.rejected}
        />

        <ApplicationsTable onDataLoaded={handleDataLoaded} />
      </div>
    </Layout>
  );
}