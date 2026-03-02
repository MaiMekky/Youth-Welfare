"use client";
import React from "react";
import "../styles/RequestDetails.css";

interface RequestDetailsProps {
  onBack?: () => void;
  onSubmit?: () => void;
}

const RequestDetails: React.FC<RequestDetailsProps> = ({ onBack, onSubmit }) => {
  const sections = [
    {
      id: 1,
      title: "مقدمة عن الأسر الطلابية",
      icon: "📄",
      content: (
        <>
          <p className="section-intro">
            الأسرة الطلابية هي وحدة تنظيمية طلابية تهدف إلى تنمية مهارات الطلاب وتعزيز روح العمل الجماعي والمشاركة الفعالة في الأنشطة الطلابية المتنوعة. تساهم الأسرة في بناء شخصية الطالب وتطوير مهاراته القيادية والاجتماعية.
          </p>
          <ul className="checklist">
            <li>تنظيم الأنشطة والفعاليات الطلابية المتنوعة</li>
            <li>تنمية المهارات القيادية والإدارية للطلاب</li>
            <li>تعزيز الانتماء والمشاركة المجتمعية</li>
          </ul>
        </>
      ),
    },
    {
      id: 2,
      title: "الأسرة المركزية",
      icon: "🏛️",
      content: (
        <>
          <p className="section-intro">
            الأسرة المركزية وحدة تنظيمية شاملة تهدف إلى تنمية مهارات الطلاب في جميع المجالات على مستوى الجامعة، وتساهم في بناء شخصية الطالب بشكل متكامل.
          </p>
          <ul className="checklist">
            <li>تنظيم الأنشطة على مستوى الجامعة</li>
            <li>تنمية المهارات القيادية في جميع المجالات</li>
            <li>تعزيز الانتماء والمشاركة المجتمعية الشاملة</li>
          </ul>
        </>
      ),
    },
    {
      id: 3,
      title: "الأسرة النوعية",
      icon: "🎯",
      content: (
        <>
          <p className="section-intro">
            الأسرة النوعية وحدة متخصصة تركز على مجال محدد (ثقافي، رياضي، فني، علمي، اجتماعي)، وتهدف إلى اكتشاف المواهب وتطويرها في المجال التخصصي.
          </p>
          <ul className="checklist">
            <li>تنظيم أنشطة متخصصة في المجال المحدد</li>
            <li>اكتشاف وتنمية المواهب التخصصية</li>
            <li>تحقيق التميز والإبداع في مجال الأسرة</li>
          </ul>
        </>
      ),
    },
    {
      id: 4,
      title: "شروط ومتطلبات الإنشاء",
      icon: "✅",
      content: (
        <div className="requirements-list">
          <p className="section-subtitle">المتطلبات الأساسية:</p>
          <ul className="bullet-list">
            <li>تحديد اسم الأسرة وأهدافها بشكل واضح</li>
            <li>تشكيل مجلس إدارة كامل (9 أعضاء)</li>
            <li>تحديد اللجان النوعية وأعضائها (7 لجان)</li>
            <li>وجود رائد أكاديمي من هيئة التدريس</li>
          </ul>
        </div>
      ),
    },
    {
      id: 5,
      title: "هيكل مجلس الإدارة",
      icon: "👥",
      content: (
        <div className="structure-layout">
          <div className="role-column">
            <p className="column-title">أعضاء مجلس الإدارة (9 أعضاء)</p>
            <ul className="bullet-list">
              <li>قائد الأسرة</li>
              <li>نائب القائد</li>
              <li>مسؤول الأسرة</li>
              <li>أمين الصندوق</li>
              <li>الأمين العام</li>
              <li>سكرتير / أمين السر</li>
              <li>الأخ الأكبر</li>
              <li>عضو منتخب (1)</li>
              <li>عضو منتخب (2)</li>
            </ul>
          </div>
          <div className="committee-column">
            <p className="column-title">اللجان النوعية (7 لجان)</p>
            <ul className="bullet-list">
              <li>اللجنة الثقافية</li>
              <li>اللجنة الرياضية</li>
              <li>اللجنة الاجتماعية والرحلات</li>
              <li>اللجنة الفنية</li>
              <li>اللجنة العلمية</li>
              <li>لجنة الخدمة العامة</li>
              <li>لجنة صحف الحائط</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 6,
      title: "خطوات التقديم والمراجعة",
      icon: "✔️",
      content: (
        <ol className="step-list">
          <li className="step-item">
            <span className="step-number">1</span>
            <div className="step-content">
              <span className="step-title">تعبئة طلب الإنشاء</span>
              <p>تعبئة جميع البيانات والمستندات المطلوبة بدقة</p>
            </div>
          </li>
          <li className="step-item">
            <span className="step-number">2</span>
            <div className="step-content">
              <span className="step-title">مراجعة إدارة رعاية الطلاب</span>
              <p>سيتم مراجعة الطلب والتحقق من استيفاء الشروط</p>
            </div>
          </li>
          <li className="step-item">
            <span className="step-number">3</span>
            <div className="step-content">
              <span className="step-title">الموافقة وتفعيل الأسرة</span>
              <p>بعد الموافقة، سيتم تفعيل الأسرة وإتاحتها للطلاب</p>
            </div>
          </li>
        </ol>
      ),
    },
  ];

  return (
    <div className="request-details-container">

      {/* ── Full-width Hero Header ── */}
      <div className="main-header-card">
        <h1 className="main-header-title">طلب إنشاء أسرة طلابية</h1>
        <div className="separator-line-gold" />
        <p className="main-header-subtitle">
          تعرف على خطوات ومتطلبات إنشاء أسرة طلابية جديدة
        </p>
      </div>

      {/* ── 2-column cards grid ── */}
      <div className="content-area">
        {sections.map((section) => (
          <div key={section.id} className="section-card">
            <div className="section-title-bar">
              <span className="section-icon">{section.icon}</span>
              <h2 className="section-heading">{section.title}</h2>
            </div>
            <div className="section-body">{section.content}</div>
          </div>
        ))}
      </div>

      {/* ── Sticky footer — two buttons only ── */}
      <div className="action-footer">
        <button className="footer-button button-back" onClick={onBack ?? (() => window.history.back())}>
          العودة
        </button>
        <button className="footer-button button-submit" onClick={onSubmit}>
          تقديم طلب الإنشاء
        </button>
      </div>

    </div>
  );
};

export default RequestDetails;