"use client";
import React from "react";
import "../styles/RequestDetails.css";

interface RequestDetailsProps {
  onBack?: () => void;
  onSubmit?: () => void;
}

const RequestDetails: React.FC<RequestDetailsProps> = ({ onBack, onSubmit }) => {
  const COLORS = {
    darkNavy: "#27285D",
    gold: "#B38E19",
    lightBg: "#F3F5FD",
    white: "#FFFFFF",
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      alert("Navigating Back (Router action not implemented).");
    }
  };

  const handleSubmitClick = () => {
    if (onSubmit) {
      onSubmit();
    } else {
      alert("Submitting Request (Form submission not implemented).");
    }
  };

  const sections = [
    {
      id: 1,
      title: "مقدمة عن الأسر الطلابية",
      icon: "📄",
      color: COLORS.white,
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
      title: "مقدمة عن الأسرة المركزية",
      icon: "🏛️",
      color: COLORS.white,
      content: (
        <>
          <p className="section-intro">
            الأسرة المركزية هي وحدة تنظيمية طلابية شاملة تهدف إلى تنمية مهارات الطلاب في جميع المجالات وتعزيز روح العمل الجماعي والمشاركة الفعالة في الأنشطة الطلابية المتنوعة على مستوى الجامعة. تساهم الأسرة المركزية في بناء شخصية الطالب وتطوير مهاراته القيادية والاجتماعية بشكل متكامل.
          </p>
          <ul className="checklist">
            <li>تنظيم الأنشطة والفعاليات الطلابية المتنوعة على مستوى الجامعة</li>
            <li>تنمية المهارات القيادية والإدارية للطلاب في جميع المجالات</li>
            <li>تعزيز الانتماء والمشاركة المجتمعية الشاملة</li>
          </ul>
        </>
      ),
    },
    {
      id: 3,
      title: "مقدمة عن الأسرة النوعية",
      icon: "🎯",
      color: COLORS.white,
      content: (
        <>
          <p className="section-intro">
            الأسرة النوعية هي وحدة تنظيمية طلابية متخصصة تركز على مجال محدد (ثقافي، رياضي، فني، علمي، اجتماعي). تهدف إلى تنمية مهارات الطلاب في هذا المجال المحدد وتعزيز التميز والإبداع فيه. تساهم الأسرة النوعية في اكتشاف المواهب وتطويرها في مجالها التخصصي.
          </p>
          <ul className="checklist">
            <li>تنظيم أنشطة وفعاليات متخصصة في المجال المحدد</li>
            <li>اكتشاف وتنمية المواهب في المجال التخصصي</li>
            <li>تحقيق التميز والإبداع في مجال الأسرة</li>
          </ul>
        </>
      ),
    },
    {
      id: 4,
      title: "شروط ومتطلبات إنشاء الأسرة",
      icon: "✅",
      color: COLORS.white,
      content: (
        <div className="requirements-list">
          <p className="section-subtitle">المتطلبات الأساسية:</p>
          <ul className="bullet-list">
            <li>تحديد اسم الأسرة وأهدافها بشكل واضح ومحدد</li>
            <li>تشكيل مجلس إدارة كامل للأسرة (9 أعضاء)</li>
            <li>تحديد اللجان النوعية وأعضائها (7 لجان)</li>
            <li>وجود رائد أكاديمي للأسرة من أعضاء هيئة التدريس</li>
          </ul>
        </div>
      ),
    },
    {
      id: 5,
      title: "هيكل مجلس إدارة الأسرة",
      icon: "👥",
      color: COLORS.white,
      content: (
        <div className="structure-layout">
          <div className="role-column">
            <p className="column-title">
              يتكون مجلس إدارة الأسرة من 9 أعضاء، لكل منهم دور ومسؤولية محددة:
            </p>
            <ul className="bullet-list">
              <li>قائد الأسرة</li>
              <li>مسؤول الأسرة</li>
              <li>أمين الصندوق</li>
              <li>الأمين العام</li>
              <li>سكرتير / أمين السر</li>
              <li>عضو منتخب (1)</li>
            </ul>
          </div>
          <div className="committee-column">
            <p className="column-title">اللجان النوعية (7 لجان):</p>
            <ul className="bullet-list">
              <li>اللجنة الثقافية</li>
              <li>اللجنة الرياضية</li>
              <li>اللجنة الاجتماعية والرحلات</li>
              <li>اللجنة الفنية</li>
              <li>لجنة حفظ القرآن</li>
              <li>لجنة إعداد القادة</li>
              <li>لجنة التدريب والتأهيل</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 6,
      title: "خطوات التقديم والمراجعة",
      icon: "✔️",
      color: COLORS.white,
      content: (
        <ol className="step-list">
          <li className="step-item">
            <span className="step-number">1</span>
            <div className="step-content">
              <span className="step-title">تعبئة طلب إنشاء الأسرة</span>
              <p>تعبئة جميع البيانات والمستندات المطلوبة بدقة</p>
            </div>
          </li>
          <li className="step-item">
            <span className="step-number">2</span>
            <div className="step-content">
              <span className="step-title">مراجعة إدارة رعاية الشباب</span>
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
      {/* Main Header */}
      <div className="main-header-card">
        <h1 className="main-header-title">طلب إنشاء أسرة طلابية</h1>
        <div className="separator-line-gold"></div>
        <p className="main-header-subtitle">
          تعرف على خطوات ومتطلبات إنشاء أسرة طلابية جديدة
        </p>
      </div>

      {/* Sections */}
      <div className="content-area">
        {sections.map((section) => (
          <div
            key={section.id}
            className="section-card"
            style={{ backgroundColor: section.color }}
          >
            <div className="section-title-bar">
              <span className="section-icon">{section.icon}</span>
              <h2 className="section-heading">{section.title}</h2>
            </div>
            <div className="section-body">{section.content}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="action-footer">
        <button
          className="footer-button button-submit"
          onClick={handleSubmitClick}
        >
          تقديم طلب الإنشاء
        </button>
        
        <button className="footer-button button-back" onClick={handleBackClick}>
          العودة
        </button>
      </div>
    </div>
  );
};

export default RequestDetails;