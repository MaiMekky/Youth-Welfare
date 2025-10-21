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
    supportReason: "",
    gpa: "",
    address: "",
    fatherStatus: "",
    motherStatus: "",
    housingStatus: "",
    disability: "",
    documents: null as File | null,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

    if (!formData.studentName.trim()) newErrors.studentName = "الاسم مطلوب";
    if (!/^\d{14}$/.test(formData.nationalId))
      newErrors.nationalId = "الرقم القومي يجب أن يكون 14 رقمًا";
    if (!formData.college.trim()) newErrors.college = "الكلية مطلوبة";
    if (!formData.year.trim()) newErrors.year = "الفرقة مطلوبة";
    if (!/^01[0-9]{9}$/.test(formData.phone))
      newErrors.phone = "رقم الهاتف غير صالح";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "البريد الإلكتروني غير صالح";
    if (!formData.supportReason.trim())
      newErrors.supportReason = "سبب الدعم مطلوب";

    // ✅ New field validations
    if (!formData.gpa.trim()) newErrors.gpa = "المعدل التراكمي مطلوب";
    else if (isNaN(Number(formData.gpa)) || Number(formData.gpa) < 0 || Number(formData.gpa) > 4)
      newErrors.gpa = "الرجاء إدخال معدل تراكمي صحيح بين 0 و 4";

    if (!formData.address.trim()) newErrors.address = "العنوان مطلوب";
    if (!formData.fatherStatus) newErrors.fatherStatus = "حالة الأب مطلوبة";
    if (!formData.motherStatus) newErrors.motherStatus = "حالة الأم مطلوبة";
    if (!formData.housingStatus) newErrors.housingStatus = "حالة المسكن مطلوبة";
    if (!formData.disability) newErrors.disability = "يرجى تحديد هل الطالب لديه إعاقة";

    if (!formData.documents) newErrors.documents = "الرجاء رفع المستندات المطلوبة";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      alert("تم إرسال الطلب بنجاح ✅");
      // send to backend here
    }
  };

  return (
    <div className="application-details-card" dir="rtl">
      <h3 className="form-title">نموذج تعبئة طلب الدعم</h3>
      <form className="apply-form" onSubmit={handleSubmit}>
        {/* Student Name */}
        <div className="form-group">
          <label>الاسم الكامل</label>
          <input
            type="text"
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
            placeholder="أدخل اسمك الكامل"
          />
          {errors.studentName && <span className="error">{errors.studentName}</span>}
        </div>

        {/* National ID */}
        <div className="form-group">
          <label>الرقم القومي</label>
          <input
            type="text"
            name="nationalId"
            value={formData.nationalId}
            onChange={handleChange}
            placeholder="أدخل الرقم القومي المكون من 14 رقمًا"
            maxLength={14}
          />
          {errors.nationalId && <span className="error">{errors.nationalId}</span>}
        </div>

        {/* College */}
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

        {/* Year */}
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

        {/* Phone */}
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

        {/* Email */}
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

        {/* GPA */}
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

        {/* Address */}
        <div className="form-group">
          <label>العنوان</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="أدخل عنوان السكن الحالي"
          />
          {errors.address && <span className="error">{errors.address}</span>}
        </div>

        {/* Family Info */}
        <div className="form-group">
          <label>حالة الأب</label>
          <select name="fatherStatus" value={formData.fatherStatus} onChange={handleChange}>
            <option value="">اختر...</option>
            <option value="حي">حي</option>
            <option value="متوفى">متوفى</option>
            <option value="منفصل">منفصل</option>
          </select>
          {errors.fatherStatus && <span className="error">{errors.fatherStatus}</span>}
        </div>

        <div className="form-group">
          <label>حالة الأم</label>
          <select name="motherStatus" value={formData.motherStatus} onChange={handleChange}>
            <option value="">اختر...</option>
            <option value="حية">حية</option>
            <option value="متوفاة">متوفاة</option>
          </select>
          {errors.motherStatus && <span className="error">{errors.motherStatus}</span>}
        </div>

        {/* Disability */}
        <div className="form-group">
          <label>هل الطالب لديه إعاقة؟</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="disability"
                value="نعم"
                checked={formData.disability === "نعم"}
                onChange={handleChange}
              />
              نعم
            </label>
            <label>
              <input
                type="radio"
                name="disability"
                value="لا"
                checked={formData.disability === "لا"}
                onChange={handleChange}
              />
              لا
            </label>
          </div>
          {errors.disability && <span className="error">{errors.disability}</span>}
        </div>

        {/* Housing Status */}
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
          {errors.housingStatus && <span className="error">{errors.housingStatus}</span>}
        </div>

        {/* Reason */}
        <div className="form-group">
          <label>سبب طلب الدعم</label>
          <textarea
            name="supportReason"
            value={formData.supportReason}
            onChange={handleChange}
            rows={4}
            placeholder="اشرح سبب طلب الدعم"
          />
          {errors.supportReason && <span className="error">{errors.supportReason}</span>}
        </div>

        {/* Document Upload Form */}
        <DocumentUploadForm />

        {/* Submit */}
        <button type="submit" className="apply-btn submit-btn">
          إرسال الطلب
        </button>
      </form>
    </div>
  );
}
