"use client";
import React, { useState, useRef } from "react";
import "../Styles/PlanView.css";
import { Upload, FileText, BarChart3, Download, Calendar, FileIcon } from "lucide-react";
import SemesterReports from "./SemesterReports";

interface SubmittedPlan {
  id: number;
  fileName: string;
  size: string;
  uploadDate: string;
  submissionDate: string;
}

export default function PlanView() {
  const [activeTab, setActiveTab] = useState<"upload" | "reports">("upload");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submittedPlans] = useState<SubmittedPlan[]>([
    {
      id: 1,
      fileName: "خطة الكلية للفصل الأول 2024.pdf",
      size: "2.4 ميجابايت",
      uploadDate: "2024-01-15",
      submissionDate: "2024-01-16",
    },
    {
      id: 2,
      fileName: "خطة الكلية للفصل الثاني 2024.docx",
      size: "1.8 ميجابايت",
      uploadDate: "2024-06-10",
      submissionDate: "2024-06-12",
    },
    {
      id: 3,
      fileName: "خطة الكلية السنوية 2023.pdf",
      size: "3.1 ميجابايت",
      uploadDate: "2023-12-20",
      submissionDate: "2023-12-22",
    },
  ]);

  const totalPlans = submittedPlans.length;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    console.log("Files uploaded:", files);
    // Handle file upload logic here
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownload = (id: number) => {
    console.log("Download plan:", id);
    // Handle download logic
  };

  const handleSendToAdmin = () => {
    console.log("Send plan to admin");
    // Handle send to admin logic
  };

  return (
    <div className="plan-view-container">
      {/* Header */}
      <div className="plan-view-header">
        <h1>خطة الكلية والتقارير</h1>
      </div>

      {/* Tabs */}
      <div className="plan-tabs">
        <button
          className={`plan-tab ${activeTab === "upload" ? "active" : ""}`}
          onClick={() => setActiveTab("upload")}
        >
          <FileText size={18} />
          خطة الكلية
        </button>
        <button
          className={`plan-tab ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          <BarChart3 size={18} />
          تقارير الفصول
        </button>
      </div>

      {/* Upload Section */}
      {activeTab === "upload" && (
        <div className="upload-section">
          <div className="upload-header">
            <h2>رفع ملف خطة الكلية</h2>
            <button className="send-to-admin-btn" onClick={handleSendToAdmin}>
              <Upload size={18} />
              إرسال للإدارة العامة
            </button>
          </div>

          {/* Upload Area */}
          <div
            className={`upload-area ${dragActive ? "drag-active" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={onButtonClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="upload-input"
              onChange={handleChange}
              accept=".pdf,.doc,.docx,.xlsx,.xls,.ppt,.pptx"
            />
            <div className="upload-icon">
              <Upload size={48} />
            </div>
            <h3>اختر ملف خطة الكلية</h3>
            <p>يمكنك رفع ملفات PDF, DOC, DOCX, XLSX, PPT, PPTX</p>
          </div>

          {/* Submitted Plans Table */}
          <div className="submitted-plans-section">
            <h2>الخطط المرفوعة سابقًا</h2>

            <div className="plans-table-wrapper">
              <table className="plans-table">
                <thead>
                  <tr>
                    <th>الإجراءات</th>
                    <th>تاريخ الإرسال</th>
                    <th>تاريخ الرفع</th>
                    <th>الحجم</th>
                    <th>اسم الملف</th>
                  </tr>
                </thead>
                <tbody>
                  {submittedPlans.map((plan) => (
                    <tr key={plan.id}>
                      <td>
                        <button
                          className="download-btn"
                          onClick={() => handleDownload(plan.id)}
                          title="تحميل"
                        >
                          <Download size={18} />
                          تحميل
                        </button>
                      </td>
                      <td>
                        <div className="date-cell">
                          <Calendar size={16} />
                          {plan.submissionDate}
                        </div>
                      </td>
                      <td>
                        <div className="date-cell">
                          <Calendar size={16} />
                          {plan.uploadDate}
                        </div>
                      </td>
                      <td>{plan.size}</td>
                      <td className="file-name-cell">
                        <FileIcon size={16} />
                        {plan.fileName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Count */}
            <div className="total-plans">
              <FileText size={24} />
              <span>إجمالي الخطط المرفوعة</span>
              <strong>{totalPlans}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Reports Section */}
      {activeTab === "reports" && (
        <div className="reports-section">
          <SemesterReports />
        </div>
      )}
    </div>
  );
}