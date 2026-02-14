"use client";
import React, { useState, useRef } from "react";
import "../Styles/SemesterReports.css";
import { Upload, Download, Calendar, FileIcon, BarChart3 } from "lucide-react";

interface SemesterReport {
  id: number;
  fileName: string;
  semester: string;
  size: string;
  uploadDate: string;
  submissionDate: string;
}

export default function SemesterReports() {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [semesterReports] = useState<SemesterReport[]>([
    {
      id: 1,
      fileName: "تقرير الفصل الأول 2024.pdf",
      semester: "الفصل الأول 2024",
      size: "1.9 ميجابايت",
      uploadDate: "2024-02-15",
      submissionDate: "2024-02-16",
    },
    {
      id: 2,
      fileName: "تقرير الفصل الثاني 2023.pdf",
      semester: "الفصل الثاني 2023",
      size: "2.1 ميجابايت",
      uploadDate: "2023-07-20",
      submissionDate: "2023-07-22",
    },
  ]);

  const totalReports = semesterReports.length;

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
    console.log("Download report:", id);
    // Handle download logic
  };

  const handleSendToAdmin = () => {
    console.log("Send report to admin");
    // Handle send to admin logic
  };

  return (
    <div className="semester-reports-container">
      {/* Upload Header */}
      <div className="semester-upload-header">
        <h2>رفع تقرير الفصل</h2>
        <button className="semester-send-btn" onClick={handleSendToAdmin}>
          <Upload size={18} />
          إرسال للإدارة العامة
        </button>
      </div>

      {/* Upload Area */}
      <div
        className={`semester-upload-area ${dragActive ? "drag-active" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="semester-upload-input"
          onChange={handleChange}
          accept=".pdf,.doc,.docx,.xlsx,.xls,.ppt,.pptx"
        />
        <div className="semester-upload-icon">
          <Upload size={48} />
        </div>
        <h3>اختر ملف تقرير الفصل</h3>
        <p>يمكنك رفع ملفات PDF, DOC, DOCX, XLSX, PPT, PPTX</p>
      </div>

      {/* Submitted Reports Table */}
      <div className="semester-submitted-section">
        <h2>التقارير المرفوعة سابقًا</h2>

        <div className="semester-table-wrapper">
          <table className="semester-table">
            <thead>
              <tr>
                <th>الإجراءات</th>
                <th>تاريخ الإرسال</th>
                <th>تاريخ الرفع</th>
                <th>الحجم</th>
                <th>الفصل الدراسي</th>
                <th>اسم الملف</th>
              </tr>
            </thead>
            <tbody>
              {semesterReports.map((report) => (
                <tr key={report.id}>
                  <td>
                    <button
                      className="semester-download-btn"
                      onClick={() => handleDownload(report.id)}
                      title="تحميل"
                    >
                      <Download size={18} />
                      تحميل
                    </button>
                  </td>
                  <td>
                    <div className="semester-date-cell">
                      <Calendar size={16} />
                      {report.submissionDate}
                    </div>
                  </td>
                  <td>
                    <div className="semester-date-cell">
                      <Calendar size={16} />
                      {report.uploadDate}
                    </div>
                  </td>
                  <td>{report.size}</td>
                  <td>
                    <div className="semester-name-cell">
                      <FileIcon size={16} />
                      {report.semester}
                    </div>
                  </td>
                  <td className="semester-file-name">
                    <FileIcon size={16} />
                    {report.fileName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total Count */}
        <div className="semester-total-count">
          <BarChart3 size={24} />
          <span>إجمالي التقارير المرفوعة</span>
          <strong>{totalReports}</strong>
        </div>
      </div>
    </div>
  );
}