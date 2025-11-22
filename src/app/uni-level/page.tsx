"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import PageHeader from "./components/PageHeader";
import Toolbar from "./components/Toolbar";
import SummaryCard from "./components/SummaryCard";
import ApplicationsTable from "./components/ApplicationsTable";
import Layout from "./Layout";
import "./ApplicationsPage.css";

interface Application {
  id: string;
  requestNumber: string;
  studentName: string;
  department: string;
  college: string;
  amount: string;
  date: string;
  status: string;
}

export default function ApplicationsPage() {


 interface Application {
  amount: string;
}
const [applications, setApplications] = useState<Application[]>([]);
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
  setApplications(apps); // 🔹 هنا التطبيقات في الجدول
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
