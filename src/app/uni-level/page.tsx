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
  // const [applications] = useState<Application[]>([
  //   { id: "REQ001", requestNumber: "57001", studentName: "أحمد محمد علي", department: "البرنامج التحضيري", college: "الهندسة", amount: "1500", date: "04/06/1970", status: "مكتمل" },
  //   { id: "REQ002", requestNumber: "57002", studentName: "فاطمة حسن", department: "البرنامج التحضيري", college: "الطب", amount: "1200", date: "04/06/1975", status: "مكتمل" },
  //   { id: "REQ003", requestNumber: "57003", studentName: "عمر خالد", department: "البرنامج التحضيري", college: "الصيدلة", amount: "1000", date: "04/06/1970", status: "مكتمل" },
  //   { id: "REQ004", requestNumber: "57004", studentName: "أميرة سعيد", department: "البرنامج التحضيري", college: "الهندسة", amount: "1800", date: "04/06/1976", status: "مكتمل" },
  //   { id: "REQ005", requestNumber: "57005", studentName: "محمد يوسف", department: "البرنامج التحضيري", college: "الآداب", amount: "800", date: "04/06/1970", status: "مكتمل" },
  //   { id: "REQ006", requestNumber: "57006", studentName: "مريم عبد الرحمن", department: "البرنامج التحضيري", college: "العلوم", amount: "1300", date: "04/06/1976", status: "مكتمل" },
  //   { id: "REQ007", requestNumber: "57007", studentName: "ياسمين عادل", department: "البرنامج التحضيري", college: "الصيدلة", amount: "1400", date: "04/06/1977", status: "مكتمل" },
  //   { id: "REQ008", requestNumber: "57008", studentName: "محمود خالد", department: "البرنامج التحضيري", college: "الحقوق", amount: "1100", date: "04/06/1970", status: "مكتمل" },
  // ]);

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
        <Toolbar />

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
