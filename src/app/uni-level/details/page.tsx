"use client";
import "./ApplicationDetails.css";

export default function ApplicationDetailsPage() {
  return (
    <div className="details-container">
      <h2 className="page-title">تفصيل طلب دعم مالي</h2>
      <p className="subtitle">
        Financial Support Application Details - All required documents
      </p>
    
      {/* Documents Section */}
      <section className="section documents">
        <h3>رفع المستندات / Documents Upload</h3>

        <div className="document-list">
          <div className="doc-card">
            <div className="doc-info">
              <h4>بحث اجتماعي من وحدة الخدمات الاجتماعية</h4>
              <p>Social research from Social Services Unit</p>
              <span className="status required">مطلوب / Required</span>
            </div>
            <button className="view-btn">View</button>
          </div>

          <div className="doc-card">
            <div className="doc-info">
              <h4>مقطوعات الدخل أو إثبات عدم وجود دخل</h4>
              <p>Income details or no income statement</p>
              <span className="status required">مطلوب / Required</span>
            </div>
            <button className="view-btn">View</button>
          </div>

          <div className="doc-card">
            <div className="doc-info">
              <h4>صورة البطاقة الشخصية للطالب أو ولي الأمر</h4>
              <p>Copy of student or guardian national ID</p>
              <span className="status required">مطلوب / Required</span>
            </div>
            <button className="view-btn">View</button>
          </div>

          <div className="doc-card">
            <div className="doc-info">
              <h4>شهادة إقامة سكن أو إيجار</h4>
              <p>Certificate of residence or rental</p>
              <span className="status missing">مفقود / Missing</span>
            </div>
            <button className="view-btn">View</button>
          </div>
        </div>
      </section>

      {/* Personal Information */}
      <section className="section info">
        <h3>البيانات الشخصية / Personal Information</h3>
        <ul>
          <li><strong>الاسم:</strong> أحمد محمد علي</li>
          <li><strong>رقم الطالب:</strong> ST001</li>
          <li><strong>الكلية:</strong> الهندسة</li>
          <li><strong>السنة:</strong> الثالثة</li>
          <li><strong>المعدل:</strong> 3.45</li>
          <li><strong>رقم الهاتف:</strong> 01234567890</li>
          <li><strong>الرقم القومي:</strong> 29912345678901</li>
        </ul>
      </section>

      {/* Family Information */}
      <section className="section info">
        <h3>بيانات الأسرة / Family Information</h3>
        <ul>
          <li><strong>اسم ولي الأمر:</strong> محمد</li>
          <li><strong>المهنة:</strong> عمل حر - الجيزة</li>
          <li><strong>الدخل الشهري:</strong> 2400 جنيه</li>
          <li><strong>عدد الأفراد:</strong> 5</li>
          <li><strong>نوع السكن:</strong> إيجار</li>
        </ul>
      </section>

      {/* Support Request Details */}
      <section className="section info">
        <h3>تفاصيل طلب الدعم / Support Request Details</h3>
        <p>
          المبلغ: <strong>500 EGP</strong><br />
          الغرض: دفع الرسوم الدراسية<br />
          وصف: وثائق إثبات الحاجة الاقتصادية جداً...
        </p>
      </section>

      {/* Application Summary */}
      <section className="section summary">
        <h3>ملخص الطلب الأصلي / Original Application Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <h4>المعلومات</h4>
            <p>Complete</p>
          </div>
          <div className="summary-item">
            <h4>المستندات</h4>
            <p>4 / 5</p>
          </div>
          <div className="summary-item">
            <h4>الحالة</h4>
            <p>Pending</p>
          </div>
        </div>
      </section>

     
    </div>
  );
}
