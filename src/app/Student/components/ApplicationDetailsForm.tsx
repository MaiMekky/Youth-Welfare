"use client";

import React, { useState } from "react";
import "../styles/applyForm.css";
import DocumentUploadForm from "./DocumentUploadForm";

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

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, files } = e.target as any;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    // Basic validations
    if (!formData.studentName.trim()) newErrors.studentName = "الاسم مطلوب";
    if (!/^\d{14}$/.test(formData.nationalId))
      newErrors.nationalId = "الرقم القومي يجب أن يكون 14 رقمًا";
    if (!formData.college.trim()) newErrors.college = "الكلية مطلوبة";
    if (!formData.year.trim()) newErrors.year = "الفرقة مطلوبة";
    if (!/^01[0-9]{9}$/.test(formData.phone))
      newErrors.phone = "رقم الهاتف غير صالح";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "البريد الإلكتروني غير صالح";

    if (!formData.gpa.trim()) newErrors.gpa = "المعدل التراكمي مطلوب";
    else if (
      isNaN(Number(formData.gpa)) ||
      Number(formData.gpa) < 0 ||
      Number(formData.gpa) > 4
    )
      newErrors.gpa = "الرجاء إدخال معدل تراكمي صحيح بين 0 و 4";

    // Family info validations
    if (!formData.address.trim()) newErrors.address = "العنوان مطلوب";
    if (!formData.fatherStatus) newErrors.fatherStatus = "حالة الأب مطلوبة";
    if (!formData.motherStatus) newErrors.motherStatus = "حالة الأم مطلوبة";
    if (!formData.familyIncome.trim())
      newErrors.familyIncome = "إجمالي دخل الأسرة مطلوب";
    if (!formData.familyMembers.trim())
      newErrors.familyMembers = "عدد أفراد الأسرة مطلوب";
    if (!formData.siblingOrder.trim())
      newErrors.siblingOrder = "الترتيب بين الإخوات مطلوب";
    if (!/^01[0-9]{9}$/.test(formData.fatherPhone))
      newErrors.fatherPhone = "رقم موبايل الأب غير صالح";
    if (!/^01[0-9]{9}$/.test(formData.motherPhone))
      newErrors.motherPhone = "رقم موبايل الأم غير صالح";
    if (!formData.disability) newErrors.disability = "يرجى تحديد حالة الإعاقة";
    if (!formData.housingStatus)
      newErrors.housingStatus = "يرجى تحديد حالة المسكن";

    // Support reason
    if (!formData.supportReason.trim())
      newErrors.supportReason = "يرجى إدخال سبب طلب الدعم";

    if (!formData.documents) newErrors.documents = "الرجاء رفع المستندات المطلوبة";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      alert("✅ تم إرسال الطلب بنجاح");
      // send to backend here
    }
  };

  return (
    <div className="application-details-card" dir="rtl">
      <h3 className="form-title">نموذج تعبئة طلب الدعم</h3>
      <form className="apply-form" onSubmit={handleSubmit}>
        {/* ===========================
             معلومات الطالب
        ============================ */}
        <h4 className="section-title">معلومات الطالب</h4>
        <div className="grid-2">
          <div className="form-group">
            <label>الاسم الكامل</label>
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
            <label>الرقم القومي</label>
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
            <label>الكلية</label>
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
            <label>الفرقة الدراسية</label>
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
            <label>رقم الهاتف</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="01XXXXXXXXX"
              maxLength={11}
            />
            {errors.phone && <span className="error">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label>البريد الإلكتروني</label>
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
            <label>المعدل التراكمي</label>
            <input
              type="text"
              name="gpa"
              value={formData.gpa}
              onChange={handleChange}
              placeholder="أدخل المعدل من 0 إلى 4"
            />
            {errors.gpa && <span className="error">{errors.gpa}</span>}
          </div>
        </div>

        {/* ===========================
             بيانات الأسرة
        ============================ */}
        <h4 className="section-title">بيانات الأسرة</h4>
        <div className="grid-2">
          <div className="form-group">
            <label>حالة الأب</label>
            <select
              name="fatherStatus"
              value={formData.fatherStatus}
              onChange={handleChange}
            >
              <option value="">اختر...</option>
              <option value="حي">حي</option>
              <option value="متوفى">متوفى</option>
              <option value="منفصل">منفصل</option>
            </select>
            {errors.fatherStatus && (
              <span className="error">{errors.fatherStatus}</span>
            )}
          </div>

          <div className="form-group">
            <label>حالة الأم</label>
            <select
              name="motherStatus"
              value={formData.motherStatus}
              onChange={handleChange}
            >
              <option value="">اختر...</option>
              <option value="حية">حية</option>
              <option value="متوفاة">متوفاة</option>
              <option value="منفصلة">منفصلة</option>
              <option value="ربة منزل">ربة منزل</option>
            </select>
            {errors.motherStatus && (
              <span className="error">{errors.motherStatus}</span>
            )}
          </div>

          <div className="form-group">
            <label>إجمالي دخل الأسرة (شهريًا)</label>
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
            <label>عدد أفراد الأسرة</label>
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
            <label>الترتيب بين الإخوات</label>
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
            <label>العنوان</label>
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
            <label>رقم موبايل الأب</label>
            <input
              type="text"
              name="fatherPhone"
              value={formData.fatherPhone}
              onChange={handleChange}
              placeholder="01XXXXXXXXX"
              maxLength={11}
            />
            {errors.fatherPhone && (
              <span className="error">{errors.fatherPhone}</span>
            )}
          </div>

          <div className="form-group">
            <label>رقم موبايل الأم</label>
            <input
              type="text"
              name="motherPhone"
              value={formData.motherPhone}
              onChange={handleChange}
              placeholder="01XXXXXXXXX"
              maxLength={11}
            />
            {errors.motherPhone && (
              <span className="error">{errors.motherPhone}</span>
            )}
          </div>

          <div className="form-group">
            <label>هل الطالب لديه إعاقة؟</label>
            <select
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
            <label>حالة المسكن</label>
            <select
              name="housingStatus"
              value={formData.housingStatus}
              onChange={handleChange}
            >
              <option value="">اختر...</option>
              <option value="ملك">ملك</option>
              <option value="إيجار">إيجار</option>
              <option value="مشترك">مشترك</option>
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
          <label>سبب طلب الدعم</label>
          <textarea
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

        {/* Upload Documents */}
        <DocumentUploadForm />

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            إرسال الطلب
          </button>
        </div>
      </form>
    </div>
  );
}
