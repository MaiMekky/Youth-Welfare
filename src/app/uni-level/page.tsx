"use client";
import { useState } from "react";
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
  const [applications] = useState<Application[]>([
    { id: "REQ001", requestNumber: "57001", studentName: "أحمد محمد علي", department: "البرنامج التحضيري", college: "الهندسة", amount: "1,500 جنيه", date: "٠٤/٠٦/٧٠", status: "مكتمل" },
    { id: "REQ002", requestNumber: "57002", studentName: "فاطمة حسن", department: "البرنامج التحضيري", college: "الطب", amount: "1,200 جنيه", date: "٠٤/٠٦/٧٥", status: "مكتمل" },
    { id: "REQ003", requestNumber: "57003", studentName: "عمر خالد", department: "البرنامج التحضيري", college: "الصيدلة", amount: "1,000 جنيه", date: "٠٤/٠٦/٧٠", status: "مكتمل" },
    { id: "REQ004", requestNumber: "57004", studentName: "أميرة سعيد", department: "البرنامج التحضيري", college: "الهندسة", amount: "1,800 جنيه", date: "٠٤/٠٦/٧٦", status: "مكتمل" },
    { id: "REQ005", requestNumber: "57005", studentName: "محمد يوسف", department: "البرنامج التحضيري", college: "الآداب", amount: "800 جنيه", date: "٠٤/٠٦/٧٠", status: "مكتمل" },
    { id: "REQ006", requestNumber: "57006", studentName: "مريم عبد الرحمن", department: "البرنامج التحضيري", college: "العلوم", amount: "1,300 جنيه", date: "٠٤/٠٦/٧٦", status: "مكتمل" },
    { id: "REQ007", requestNumber: "57007", studentName: "ياسمين عادل", department: "البرنامج التحضيري", college: "الصيدلة", amount: "1,400 جنيه", date: "٠٤/٠٦/٧٧", status: "مكتمل" },
    { id: "REQ008", requestNumber: "57008", studentName: "محمود خالد", department: "البرنامج التحضيري", college: "الحقوق", amount: "1,100 جنيه", date: "٠٤/٠٦/٧٠", status: "مكتمل" },
  ]);

  return (
    <Layout>
      <Head>
        <title>الطلبات المعتمدة على مستوى الجامعة</title>
      </Head>

      <div className="applications-container">
        <PageHeader />
        <Toolbar />
        <SummaryCard totalRequests={applications.length} totalAmount="10,100 جنيه" />
        <ApplicationsTable applications={applications} />
      </div>
    </Layout>
  );
}
