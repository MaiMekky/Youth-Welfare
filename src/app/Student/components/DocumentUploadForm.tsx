"use client";

import React, { useState } from "react";
import { Upload } from "lucide-react";
import "../styles/applyForm.css";

export default function DocumentUploadForm() {
  const [files, setFiles] = useState<{ [key: string]: File | null }>({});

  const documents = [
    {
      id: "socialResearch",
      title: "بحث اجتماعي من وحدة التضامن الاجتماعي",
      description: "بحث اجتماعي معتمد من وحدة التضامن الاجتماعي بالجامعة أو بالمنطقة.",
      required: true,
    },
    {
      id: "salaryProof",
      title: "مفردات المرتب أو المعاش أو ما يفيد بالدخل",
      description: "مفردات مرتب حديثة أو شهادة معاش أو إفادة دخل معتمدة من جهة العمل.",
      required: true,
    },
    {
      id: "fatherId",
      title: "صورة البطاقة الشخصية للوالد (أو ولي الأمر)",
      description: "صورة واضحة من وجهي البطاقة الشخصية للوالد أو ولي الأمر.",
      required: true,
    },
    {
      id: "studentId",
      title: "صورة البطاقة الشخصية للطالب",
      description: "صورة واضحة من وجهي البطاقة الشخصية للطالب المتقدم للدعم.",
      required: true,
    },
    {
      id: "landProof",
      title: "حيازة زراعية لسكان الأقاليم",
      description: "شهادة حيازة زراعية أو ملكية أرض زراعية للمقيمين في المحافظات (إن وجدت).",
      required: false,
    },
  ];

  const handleFileChange = (id: string, file: File | null) => {
    setFiles((prev) => ({ ...prev, [id]: file }));
  };

  const handleSubmit = () => {
    const missingRequired = documents.filter(
      (doc) => doc.required && !files[doc.id]
    );

    if (missingRequired.length > 0) {
      alert("يرجى رفع جميع المستندات المطلوبة قبل تقديم الطلب ❗");
      return;
    }

    alert("تم تقديم الطلب بنجاح ✅");
  };

  return (
    <div className="upload-container">
      <h3 className="upload-title">رفع المستندات</h3>

      <div className="documents-grid">
        {documents.map((doc) => (
          <div key={doc.id} className="document-card">
            <div className="document-header">
              <h4>{doc.title}</h4>
              {doc.required && <span className="required-badge">مطلوب</span>}
            </div>
            <p className="document-desc">{doc.description}</p>

            <label className="upload-btn">
              <Upload size={18} />
              <span>
                {files[doc.id] ? files[doc.id]?.name : "رفع المستند"}
              </span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  handleFileChange(doc.id, e.target.files?.[0] || null)
                }
                hidden
              />
            </label>
          </div>
        ))}
      </div>

   
    </div>
  );
}
