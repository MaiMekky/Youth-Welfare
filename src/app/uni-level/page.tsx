"use client";
import { useState } from "react";
import Head from "next/head";
import PageHeader from "./components/PageHeader";
import SummaryCard from "./components/SummaryCard";
import ApplicationsTable from "./components/ApplicationsTable";
import Layout from "./Layout";
import "./ApplicationsPage.css";

export default function ApplicationsPage() {


 interface Application {
  amount: string;
}
const [summaryData, setSummaryData] = useState({
  totalRequests: 0,
  totalAmount: "0 ج.م",
});

const calculateSummary = (apps: Application[]) => {
  const totalRequests = apps.length;
  const totalAmount = apps.reduce((sum, app) => {
    const cleaned = app.amount.replace(/[^\d.-]/g, "").replace(/,/g, "");
    const value = parseFloat(cleaned) || 0;
    return sum + value;
  }, 0);
  return {
    totalRequests,
    totalAmount: totalAmount.toLocaleString("en-US") + " ج.م",
  };
};

const handleDataLoaded = (apps: Application[]) => {
  setSummaryData(calculateSummary(apps)); // 🔹 نفس الدالة لحساب الملخص
};


  return (
    <Layout>
      <Head>
        <title>الطلبات المعتمدة على مستوى الجامعة</title>
      </Head>

      <div className="applications-container">
        <PageHeader />
        {/* <Toolbar /> */}
        
        <SummaryCard
          totalRequests={summaryData.totalRequests}
          totalAmount={summaryData.totalAmount}
        />

        {/* 👇 ApplicationsTable هنا لا يحتاج أي props */}
        <ApplicationsTable  onDataLoaded={handleDataLoaded}/>
      </div>
    </Layout>
  );
}
