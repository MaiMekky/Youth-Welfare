"use client";
import React, { useState } from "react";
import { Upload } from "lucide-react";
import Image from "next/image";
import "../styles/applyForm.css";


export default function ApplicationDetailsForm() {
  const [formData, setFormData] = useState({
    studentName: "",
    nationalId: "",
    college: "",
    year: "",
    phone: "",
    email: "",
    gpa: "",
    address: "",
    fatherStatus: "",
    motherStatus: "",
    familyIncome: "",
    familyMembers: "",
    siblingOrder: "",
    fatherPhone: "",
    motherPhone: "",
    disability: "",
    housingStatus: "",
    supportReason: "",
    documents: null as File | null,
  });

  const [documents, setDocuments] = useState<{ [key: string]: File | null }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as any;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.studentName.trim()) newErrors.studentName = "الاسم الكامل مطلوب";
    if (!/^\d{14}$/.test(formData.nationalId))
      newErrors.nationalId = "الرقم القومي يجب أن يكون 14 رقمًا";
    if (!formData.college.trim()) newErrors.college = "الكلية مطلوبة";
    if (!formData.year.trim()) newErrors.year = "الفرقة مطلوبة";
    if (!/^\+20\d{10}$/.test(formData.phone))
      newErrors.phone = "رقم الهاتف يجب أن يكون بصيغة +20XXXXXXXXXX";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "البريد الإلكتروني غير صالح";
    if (!formData.gpa.trim()) newErrors.gpa = "التقدير مطلوب";
    if (!formData.address.trim()) newErrors.address = "العنوان مطلوب";
    if (!formData.fatherStatus) newErrors.fatherStatus = "حالة الأب مطلوبة";
    if (!formData.motherStatus) newErrors.motherStatus = "حالة الأم مطلوبة";
    if (!formData.familyIncome.trim()) newErrors.familyIncome = "إجمالي دخل الأسرة مطلوب";
    if (!formData.familyMembers.trim()) newErrors.familyMembers = "عدد أفراد الأسرة مطلوب";
    if (!formData.siblingOrder.trim()) newErrors.siblingOrder = "الترتيب بين الإخوات مطلوب";
    if (!/^\+20\d{10}$/.test(formData.fatherPhone))
      newErrors.fatherPhone = "رقم موبايل الأب يجب أن يكون بصيغة +20XXXXXXXXXX";
    if (!/^\+20\d{10}$/.test(formData.motherPhone))
      newErrors.motherPhone = "رقم موبايل الأم يجب أن يكون بصيغة +20XXXXXXXXXX";
    if (!formData.disability) newErrors.disability = "يرجى تحديد حالة الإعاقة";
    if (!formData.housingStatus) newErrors.housingStatus = "يرجى تحديد حالة المسكن";
    if (!formData.supportReason.trim()) newErrors.supportReason = "يرجى إدخال سبب طلب الدعم";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
const formPayload = new FormData();
formPayload.append("family_numbers", String(formData.familyMembers));
formPayload.append("father_status", formData.fatherStatus);
formPayload.append("mother_status", formData.motherStatus);
formPayload.append("father_income", String(formData.familyIncome)); // أو أقسمي الأب والأم لو عندك
formPayload.append("arrange_of_brothers", String(formData.siblingOrder));
formPayload.append("f_phone_num", formData.fatherPhone);
formPayload.append("m_phone_num", formData.motherPhone);
formPayload.append("reason", formData.supportReason);
formPayload.append("disabilities", formData.disability || "");
formPayload.append("grade", formData.gpa);
formPayload.append("address", formData.address);
formPayload.append("housing_status", formData.housingStatus);
formPayload.append("req_type", "financial_aid");

 const fileKeyMap: Record<string, string> = {
  socialResearch: "social_research_file",
  salaryProof: "salary_proof_file",
  fatherId: "father_id_file",
  studentId: "student_id_file",
  landProof: "land_ownership_file",  // ⚠️ You have "land_proof_file" in one place
  takafulCard: "sd_file",  // ⚠️ Mismatch with backend
};
    Object.entries(documents).forEach(([key, file]) => {
      if (!file) return;
      const apiKey = fileKeyMap[key];
      if (apiKey) formPayload.append(apiKey, file);
    });
 const token = localStorage.getItem('access');
    try {
      const response = await fetch("http://127.0.0.1:8000/api/solidarity/student/apply/", {
        method: "POST",
        body: formPayload,
          headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        console.log("Server response:", data);
        alert("✅ تم إرسال الطلب بنجاح");
        setShowSuccess(true);
        
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Submission error:", errorData);
        alert("❌ حدث خطأ أثناء الإرسال، راجعي التفاصيل في Console");
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("⚠️ فشل الاتصال بالسيرفر. تأكدي أن السيرفر شغّال وإعدادات CORS صحيحة.");
    }
  };

  const DocumentUploadForm = ({
  files,
  onDocumentsChange,
}: {
  files: Record<string, File | null>;
  onDocumentsChange?: (files: Record<string, File | null>) => void;
}) => {
  const documentsList = [
    { id: "socialResearch", title: "بحث اجتماعي من وحدة التضامن الاجتماعي", description: "بحث اجتماعي معتمد من الوحدة.", required: true },
    { id: "salaryProof", title: "مفردات المرتب أو المعاش أو ما يفيد بالدخل", description: "مفردات مرتب حديثة أو شهادة معاش.", required: true },
    { id: "fatherId", title: "صورة البطاقة الشخصية للوالد", description: "صورة واضحة من وجهي البطاقة.", required: true },
    { id: "studentId", title: "صورة البطاقة الشخصية للطالب", description: "صورة من وجهي البطاقة الشخصية للطالب.", required: true },
    { id: "landProof", title: "حيازة زراعية لسكان الأقاليم", description: "شهادة حيازة أو ملكية أرض زراعية.", required: false },
    { id: "takafulCard", title: "صورة بطاقة تكافل وكرامة", description: "صورة من البطاقة إن وجدت.", required: false },
  ];

  const handleFileChange = (id: string, file: File | null) => {
    if (onDocumentsChange) {
      const updated = { ...files, [id]: file };
      onDocumentsChange(updated);
    }
  };

  return (
    <div className="upload-container">
      <h3 className="upload-title">رفع المستندات</h3>

      <div className="documents-grid">
        {documentsList.map((doc) => (
          <div key={doc.id} className="document-card">
            <div className="document-header">
              <h4 style={{ color: "#2C3A5F" }}>{doc.title}</h4>
              {doc.required && <span className="required-badge">مطلوب</span>}
            </div>
            <p className="document-desc">{doc.description}</p>

            <label className="upload-btn">
              <Upload size={18} />
              <span>{files[doc.id] ? files[doc.id]?.name : "رفع المستند"}</span>
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
};

  return (
    <div className="application-details-card" dir="rtl">
      <div className="form-header">
        <h2 className="main-title">نموذج تعبئة طلب الدعم</h2>
        <p className="subtitle">
          <strong>تنويه هام:</strong> يرجى التأكد من رفع جميع المستندات المطلوبة بدقة قبل إرسال الطلب.
        </p>
      </div>

      <form className="apply-form" onSubmit={handleSubmit}>
        <h4 className="section-title">معلومات الطالب</h4>
        <div className="grid-2">
          <div className="form-group">
            <label  style={{color:"#2C3A5F"}}>الاسم الكامل</label>
            <input
              type="text"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              placeholder="أدخل اسمك الكامل"
            />
            {errors.studentName && (
              <span className="error">{errors.studentName}</span>
            )}
          </div>

          <div className="form-group">
            <label  style={{color:"#2C3A5F"}}>الرقم القومي</label>
            <input
              type="text"
              name="nationalId"
              value={formData.nationalId}
              onChange={handleChange}
              placeholder="الرقم القومي (14 رقمًا)"
              maxLength={14}
            />
            {errors.nationalId && (
              <span className="error">{errors.nationalId}</span>
            )}
          </div>

          <div className="form-group">
            <label style={{color:"#2C3A5F"}}>الكلية</label>
            <input
              type="text"
              name="college"
              value={formData.college}
              onChange={handleChange}
              placeholder="اكتب اسم كليتك"
            />
            {errors.college && <span className="error">{errors.college}</span>}
          </div>

          <div className="form-group">
            <label  style={{color:"#2C3A5F"}}>الفرقة الدراسية</label>
            <input
              type="text"
              name="year"
              value={formData.year}
              onChange={handleChange}
              placeholder="مثال: الفرقة الثالثة"
            />
            {errors.year && <span className="error">{errors.year}</span>}
          </div>

          <div className="form-group">
            <label  style={{color:"#2C3A5F"}}>رقم الهاتف</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="201XXXXXXXXX+"
              maxLength={13}
            />
            {errors.phone && <span className="error">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label  style={{color:"#2C3A5F"}}>البريد الإلكتروني</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
<div className="form-group">
  <label style={{ color: "#2C3A5F" }}>التقدير</label>
  <select style={{ color: "#2C3A5F" }}
    name="gpa"
    value={formData.gpa}
    onChange={handleChange}
  >
    <option value="" hidden>اختر...</option>
    <option value="امتياز">امتياز</option>
    <option value="جيد جدا">جيد جدًا</option>
    <option value="جيد">جيد</option>
    <option value="مقبول">مقبول</option>
  </select>
  {errors.gpa && <span className="error">{errors.gpa}</span>}
</div>

        </div>

        {/* ===========================
             بيانات الأسرة
        ============================ */}
        <h4 className="section-title">بيانات الأسرة</h4>
        <div className="grid-2">
    <div className="form-group">
  <label style={{ color: "#2C3A5F" }}>حالة الأب</label>
  <select
    style={{ color: "#2C3A5F" }}
    name="fatherStatus"
    value={formData.fatherStatus}
    onChange={handleChange}
  >
    <option value="" disabled hidden>اختر...</option>
    <option value="working">يعمل</option>
    <option value="retired">بالمعاش</option>
    <option value="sick">مريض</option>
    <option value="deceased">متوفى</option>
  </select>
  {errors.fatherStatus && (
    <span className="error">{errors.fatherStatus}</span>
  )}
</div>

<div className="form-group">
  <label style={{ color: "#2C3A5F" }}>حالة الأم</label>
  <select
    style={{ color: "#2C3A5F" }}
    name="motherStatus"
    value={formData.motherStatus}
    onChange={handleChange}
  >
    <option value="" disabled hidden>اختر...</option>
    <option value="working">تعمل</option>
    <option value="retired">بالمعاش</option>
    <option value="sick">مريضة</option>
    <option value="deceased">متوفاة</option>
  </select>
  {errors.motherStatus && (
    <span className="error">{errors.motherStatus}</span>
  )}
</div>


          <div className="form-group">
            <label  style={{color:"#2C3A5F"}}>إجمالي دخل الأسرة (شهريًا)</label>
            <input
              type="number"
              name="familyIncome"
              value={formData.familyIncome}
              onChange={handleChange}
              placeholder="أدخل إجمالي الدخل"
            />
            {errors.familyIncome && (
              <span className="error">{errors.familyIncome}</span>
            )}
          </div>

          <div className="form-group">
            <label  style={{color:"#2C3A5F"}}>عدد أفراد الأسرة</label>
            <input
              type="number"
              name="familyMembers"
              value={formData.familyMembers}
              onChange={handleChange}
              placeholder="عدد الأفراد"
            />
            {errors.familyMembers && (
              <span className="error">{errors.familyMembers}</span>
            )}
          </div>

          <div className="form-group">
            <label  style={{color:"#2C3A5F"}}>الترتيب بين الإخوات</label>
            <input
              type="number"
              name="siblingOrder"
              value={formData.siblingOrder}
              onChange={handleChange}
              placeholder="مثال: 1"
            />
            {errors.siblingOrder && (
              <span className="error">{errors.siblingOrder}</span>
            )}
          </div>

          <div className="form-group">
            <label style={{color:"#2C3A5F"}}>العنوان</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="أدخل العنوان الكامل"
            />
            {errors.address && <span className="error">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label style={{color:"#2C3A5F"}}>رقم موبايل الأب</label>
            <input
              type="text"
              name="fatherPhone"
              value={formData.fatherPhone}
              onChange={handleChange}
              placeholder="201XXXXXXXXX+"
              maxLength={13}
            />
            {errors.fatherPhone && (
              <span className="error">{errors.fatherPhone}</span>
            )}
          </div>

          <div className="form-group">
            <label style={{color:"#2C3A5F"}}>رقم موبايل الأم</label>
            <input
              type="text"
              name="motherPhone"
              value={formData.motherPhone}
              onChange={handleChange}
              placeholder="201XXXXXXXXX+"
              maxLength={13}
            />
            {errors.motherPhone && (
              <span className="error">{errors.motherPhone}</span>
            )}
          </div>

          <div className="form-group">
            <label style={{color:"#2C3A5F"}}>هل الطالب لديه إعاقة؟</label>
            <select  style={{color:"#2C3A5F"}}
              name="disability"
              value={formData.disability}
              onChange={handleChange}
            >
              <option value="">اختر...</option>
              <option value="نعم">نعم</option>
              <option value="لا">لا</option>
            </select>
            {errors.disability && (
              <span className="error">{errors.disability}</span>
            )}
          </div>

          <div className="form-group">
            <label style={{color:"#2C3A5F"}}>حالة المسكن</label>
            <select  style={{color:"#2C3A5F"}}
              name="housingStatus"
              value={formData.housingStatus}
              onChange={handleChange}
            >
              <option value="">اختر...</option>
              <option value="ملك">ملك</option>
              <option value="ايجار">ايجار</option>
        
            </select>
            {errors.housingStatus && (
              <span className="error">{errors.housingStatus}</span>
            )}
          </div>
        </div>

        {/* ===========================
             تفاصيل طلب الدعم
        ============================ */}
        <h4 className="section-title">تفاصيل طلب الدعم</h4>
        <div className="form-group">
          <label style={{color:"#2C3A5F"}}>سبب طلب الدعم</label>
          <textarea style={{color:"#2C3A5F"}}
            name="supportReason"
            value={formData.supportReason}
            onChange={handleChange}
            rows={4}
            placeholder="اشرح الظروف التي تستدعي طلب الدعم المالي..."
          />
          {errors.supportReason && (
            <span className="error">{errors.supportReason}</span>
          )}
        </div>
  <DocumentUploadForm 
  files={documents}
  onDocumentsChange={(updated) => {
    setDocuments(updated);
    console.log("📁 الملفات الحالية:", updated);
  }} 
/>
{/* <DocumentUploadForm/> */}
        <div className="form-actions">
          <button type="submit" className="submit-btn">إرسال الطلب</button>
        </div>
      </form>
    </div>
  );
}
