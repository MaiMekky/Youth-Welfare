"use client";
import React, { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import "../styles/applyForm.css";

interface ApplicationDetailsFormProps {
  onSuccess?: () => void;
  onNotify?: (message: string, type: "success" | "warning" | "error") => void;
}

export default function ApplicationDetailsForm({ onSuccess, onNotify }: ApplicationDetailsFormProps) {
  const [formData, setFormData] = useState({
    gpa: "", AcademicStatus: "",
    fatherStatus: "", motherStatus: "", FatherIncome: "", MotherIncome: "",
    familyMembers: "", siblingOrder: "", fatherPhone: "", motherPhone: "",
    housingStatus: "", address: "", disability: "", TakafulWKarama: "",
    supportReason: "",
  });

  const [documents, setDocuments] = useState<Record<string, File | null>>({});
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{ message: string; type: "success"|"warning"|"error" } | null>(null);

  const requiredDocs = ["socialResearch", "salaryProof", "fatherId", "studentId"];

  const showNotification = (message: string, type: "success"|"warning"|"error") => {
    if (onNotify) { onNotify(message, type); return; }
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => { const n = {...prev}; delete n[name]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.gpa)              e.gpa            = "التقدير مطلوب";
    if (!formData.address.trim())   e.address        = "العنوان مطلوب";
    if (!formData.fatherStatus)     e.fatherStatus   = "حالة الأب مطلوبة";
    if (!formData.motherStatus)     e.motherStatus   = "حالة الأم مطلوبة";
    if (formData.fatherStatus !== "متوفى"  && !formData.FatherIncome.trim()) e.FatherIncome = "دخل الأب مطلوب";
    if (formData.motherStatus !== "متوفاة" && !formData.MotherIncome.trim()) e.MotherIncome = "دخل الأم مطلوب";
    if (!formData.familyMembers.trim()) e.familyMembers = "عدد أفراد الأسرة مطلوب";
    if (!formData.siblingOrder.trim())  e.siblingOrder  = "الترتيب بين الإخوات مطلوب";
    if (!/^\+20\d{10}$/.test(formData.fatherPhone)) e.fatherPhone = "صيغة +20XXXXXXXXXX";
    if (!/^\+20\d{10}$/.test(formData.motherPhone)) e.motherPhone = "صيغة +20XXXXXXXXXX";
    if (!formData.disability)      e.disability      = "يرجى تحديد حالة الإعاقة";
    if (!formData.housingStatus)   e.housingStatus   = "يرجى تحديد حالة المسكن";
    if (!formData.supportReason.trim()) e.supportReason = "يرجى إدخال سبب طلب الدعم";
    requiredDocs.forEach(k => { if (!documents[k]) e[k] = "هذا المستند مطلوب"; });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }

    const payload = new FormData();
    payload.append("family_numbers",    formData.familyMembers);
    payload.append("father_status",     formData.fatherStatus);
    payload.append("mother_status",     formData.motherStatus);
    if (formData.fatherStatus !== "متوفى")  payload.append("father_income", formData.FatherIncome);
    if (formData.motherStatus !== "متوفاة") payload.append("mother_income", formData.MotherIncome);
    payload.append("arrange_of_brothers", formData.siblingOrder);
    payload.append("f_phone_num",   formData.fatherPhone);
    payload.append("m_phone_num",   formData.motherPhone);
    payload.append("reason",        formData.supportReason);
    payload.append("disabilities",  formData.disability);
    payload.append("sd",            formData.TakafulWKarama);
    payload.append("acd_status",    formData.AcademicStatus);
    payload.append("grade",         formData.gpa);
    payload.append("address",       formData.address);
    payload.append("housing_status",formData.housingStatus);
    payload.append("req_type",      "financial_aid");

    const fileKeyMap: Record<string, string> = {
      socialResearch: "social_research_file",
      salaryProof:    "salary_proof_file",
      fatherId:       "father_id_file",
      studentId:      "student_id_file",
      landProof:      "land_ownership_file",
      takafulCard:    "sd_file",
    };
    Object.entries(documents).forEach(([k, f]) => {
      if (f && fileKeyMap[k]) payload.append(fileKeyMap[k], f);
    });

    try {
      const token = localStorage.getItem("access");
      const res = await fetch("http://127.0.0.1:8000/api/solidarity/student/apply/", {
        method: "POST", body: payload,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showNotification("تم إرسال الطلب بنجاح ✅", "success");
        if (onSuccess) onSuccess();
      } else {
        showNotification("❌ حدث خطأ أثناء الإرسال", "error");
      }
    } catch {
      showNotification("⚠️ فشل الاتصال بالسيرفر", "error");
    }
  };

  const documentsList = [
    { id: "socialResearch", title: "بحث اجتماعي من وحدة التضامن الاجتماعي", desc: "بحث اجتماعي معتمد من الوحدة.", required: true },
    { id: "salaryProof",    title: "مفردات المرتب أو المعاش أو ما يفيد بالدخل", desc: "مفردات مرتب حديثة أو شهادة معاش.", required: true },
    { id: "fatherId",       title: "صورة البطاقة الشخصية للوالد", desc: "صورة واضحة من وجهي البطاقة.", required: true },
    { id: "studentId",      title: "صورة البطاقة الشخصية للطالب", desc: "صورة من وجهي البطاقة الشخصية للطالب.", required: true },
    { id: "landProof",      title: "حيازة زراعية لسكان الأقاليم", desc: "شهادة حيازة أو ملكية أرض زراعية.", required: false },
    { id: "takafulCard",    title: "صورة بطاقة تكافل وكرامة", desc: "صورة من البطاقة إن وجدت.", required: false },
  ];

  return (
    <div className="application-details-card" dir="rtl">

      {/* ── Hero header ── */}
      <div className="form-header">
        <h2 className="main-title">نموذج تعبئة طلب الدعم</h2>
        <p className="subtitle">
          <strong>تنويه هام:</strong> يرجى التأكد من رفع جميع المستندات المطلوبة بدقة قبل إرسال الطلب.
        </p>
      </div>

      <form className="apply-form" onSubmit={handleSubmit}>

        {/* ══ معلومات الطالب ══ */}
        <div className="form-section">
          <h4 className="section-title">معلومات الطالب</h4>
          <div className="grid-3">
            <div className="form-group">
              <label>التقدير</label>
              <select name="gpa" value={formData.gpa} onChange={handleChange}>
                <option value="" hidden>اختر...</option>
                <option value="امتياز">امتياز</option>
                <option value="جيد جدا">جيد جدا</option>
                <option value="جيد">جيد</option>
                <option value="مقبول">مقبول</option>
              </select>
              {errors.gpa && <span className="error">{errors.gpa}</span>}
            </div>

            <div className="form-group">
              <label>النظام الأكاديمي</label>
              <select name="AcademicStatus" value={formData.AcademicStatus} onChange={handleChange}>
                <option value="" hidden>اختر...</option>
                <option value="انتظام">انتظام</option>
                <option value="انتساب">انتساب</option>
              </select>
              {errors.AcademicStatus && <span className="error">{errors.AcademicStatus}</span>}
            </div>

            <div className="form-group">
              <label>العنوان</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="أدخل العنوان الكامل" />
              {errors.address && <span className="error">{errors.address}</span>}
            </div>
          </div>
        </div>

        {/* ══ بيانات الأسرة ══ */}
        <div className="form-section">
          <h4 className="section-title">بيانات الأسرة</h4>
          <div className="grid-3">
            <div className="form-group">
              <label>حالة الأب</label>
              <select name="fatherStatus" value={formData.fatherStatus} onChange={handleChange}>
                <option value="" disabled hidden>اختر...</option>
                <option value="يعمل">يعمل</option>
                <option value="بالمعاش">بالمعاش</option>
                <option value="مريض">مريض</option>
                <option value="متوفى">متوفى</option>
              </select>
              {errors.fatherStatus && <span className="error">{errors.fatherStatus}</span>}
            </div>

            <div className="form-group">
              <label>حالة الأم</label>
              <select name="motherStatus" value={formData.motherStatus} onChange={handleChange}>
                <option value="" disabled hidden>اختر...</option>
                <option value="تعمل">تعمل</option>
                <option value="بالمعاش">بالمعاش</option>
                <option value="مريضة">مريضة</option>
                <option value="متوفاة">متوفاة</option>
              </select>
              {errors.motherStatus && <span className="error">{errors.motherStatus}</span>}
            </div>

            <div className="form-group">
              <label>حالة المسكن</label>
              <select name="housingStatus" value={formData.housingStatus} onChange={handleChange}>
                <option value="" hidden>اختر...</option>
                <option value="ملك">ملك</option>
                <option value="ايجار">ايجار</option>
              </select>
              {errors.housingStatus && <span className="error">{errors.housingStatus}</span>}
            </div>

            <div className="form-group">
              <label>دخل الأب</label>
              <input type="number" name="FatherIncome"
                value={formData.fatherStatus === "متوفى" ? "" : formData.FatherIncome}
                onChange={handleChange} placeholder="أدخل دخل الأب"
                disabled={formData.fatherStatus === "متوفى"} />
              {errors.FatherIncome && <span className="error">{errors.FatherIncome}</span>}
            </div>

            <div className="form-group">
              <label>دخل الأم</label>
              <input type="number" name="MotherIncome"
                value={formData.motherStatus === "متوفاة" ? "" : formData.MotherIncome}
                onChange={handleChange} placeholder="أدخل دخل الأم"
                disabled={formData.motherStatus === "متوفاة"} />
              {errors.MotherIncome && <span className="error">{errors.MotherIncome}</span>}
            </div>

            <div className="form-group">
              <label>عدد أفراد الأسرة</label>
              <input type="number" name="familyMembers" value={formData.familyMembers} onChange={handleChange} placeholder="عدد الأفراد" />
              {errors.familyMembers && <span className="error">{errors.familyMembers}</span>}
            </div>

            <div className="form-group">
              <label>الترتيب بين الإخوات</label>
              <input type="number" name="siblingOrder" value={formData.siblingOrder} onChange={handleChange} placeholder="مثال: 1" />
              {errors.siblingOrder && <span className="error">{errors.siblingOrder}</span>}
            </div>

            <div className="form-group">
              <label>رقم موبايل الأب</label>
              <input type="text" name="fatherPhone" value={formData.fatherPhone} onChange={handleChange} placeholder="+20XXXXXXXXXX" maxLength={13} />
              {errors.fatherPhone && <span className="error">{errors.fatherPhone}</span>}
            </div>

            <div className="form-group">
              <label>رقم موبايل الأم</label>
              <input type="text" name="motherPhone" value={formData.motherPhone} onChange={handleChange} placeholder="+20XXXXXXXXXX" maxLength={13} />
              {errors.motherPhone && <span className="error">{errors.motherPhone}</span>}
            </div>

            <div className="form-group">
              <label>هل الطالب لديه إعاقة؟</label>
              <select name="disability" value={formData.disability} onChange={handleChange}>
                <option value="" hidden disabled>اختر...</option>
                <option value="نعم">نعم</option>
                <option value="لا">لا</option>
              </select>
              {errors.disability && <span className="error">{errors.disability}</span>}
            </div>

            <div className="form-group">
              <label>هل الطالب مشترك في تكافل وكرامة؟</label>
              <select name="TakafulWKarama" value={formData.TakafulWKarama} onChange={handleChange}>
                <option value="" hidden disabled>اختر...</option>
                <option value="مشترك">مشترك</option>
                <option value="غير مشترك">غير مشترك</option>
              </select>
              {errors.TakafulWKarama && <span className="error">{errors.TakafulWKarama}</span>}
            </div>
          </div>
        </div>

        {/* ══ تفاصيل طلب الدعم ══ */}
        <div className="form-section">
          <h4 className="section-title">تفاصيل طلب الدعم</h4>
          <div className="form-group">
            <label>سبب طلب الدعم</label>
            <textarea name="supportReason" value={formData.supportReason} onChange={handleChange}
              rows={4} placeholder="اشرح الظروف التي تستدعي طلب الدعم المالي..." />
            {errors.supportReason && <span className="error">{errors.supportReason}</span>}
          </div>
        </div>

        {/* ══ رفع المستندات ══ */}
        <div className="upload-container">
          <h3 className="upload-title">رفع المستندات</h3>
          <div className="documents-grid">
            {documentsList.map((doc) => (
              <div key={doc.id} className="document-card">
                <div className="document-header">
                  <h4>{doc.title}</h4>
                  {doc.required && <span className="required-badge">مطلوب</span>}
                </div>
                <p className="document-desc">{doc.desc}</p>
                {errors[doc.id] && <span className="error">{errors[doc.id]}</span>}
                <label className={`upload-btn ${documents[doc.id] ? "uploaded" : ""}`}>
                  <Upload size={14} />
                  <span>{documents[doc.id] ? documents[doc.id]?.name : "رفع المستند"}</span>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setDocuments(prev => ({ ...prev, [doc.id]: e.target.files?.[0] || null }))}
                    hidden />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">إرسال الطلب</button>
        </div>
      </form>

      {notification && (
        <div className={`notification ${notification.type}`} style={{
          backgroundColor: notification.type === "success" ? "#22c55e" : notification.type === "error" ? "#ef4444" : "#f59e0b",
        }}>
          {notification.message}
        </div>
      )}
    </div>
  );
}