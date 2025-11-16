import React from "react";

type Props = {
  // static component
};

export default function Cards(_: Props) {
  return (
    <div dir="rtl" className="cards-root">
      <style>{`
        :root{
          --bg:#f6f9ff;
          --card-bg: #ffffff;
          --muted:#64748b;
          --title:#2C3A5F;
          --text:#2C3A5F;
          --accent:#c18f00;
        }

        .cards-root{
          font-family: 'Noto Kufi Arabic', 'Noto Sans', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
          background: var(--bg);
          padding: 24px;
          min-height: 100vh;
          color: var(--text);
          box-sizing: border-box;
        }

        .card{
          max-width: 1100px;
          margin: 0 auto;
          background: var(--card-bg);
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 6px 18px rgba(12, 38, 86, 0.08);
          box-sizing: border-box;
        }

        .card + .card { margin-top: 20px; }

        h1{ font-size: 22px; margin: 0; color: var(--title); }
        .lead { color: var(--muted); margin-top: 12px; line-height: 1.7; }

        /* Overview grid */
        .overview-grid{
          display:flex;
          gap:16px;
          margin-top:18px;
          align-items:flex-start;
        }
        .info-card{
          flex:1;
          background:#f8fafc;
          padding:14px;
          border-radius:10px;
        }
        .info-card h3{ margin:0 0 8px 0; color:var(--title); }
        ul { margin:0; padding-left:18px; color:#334155; }

        hr.separator { margin: 20px 0; border: none; border-top: 1px solid #eef2ff; }

        .subtitle { margin: 0 0 8px 0; color: var(--title); }

        .tracking-row { display:flex; gap:16px; margin-top:8px; align-items:flex-start; flex-wrap:wrap; }
        .box {
          padding:16px;
          border-radius:10px;
          background:#eef2ff;
          box-sizing:border-box;
        }
        .request-box { min-width: 320px; flex: 1 1 320px; }
        .box-title { margin:0 0 6px 0; color: var(--title); }
        .small-list { margin:0; padding-left:18px; color:#334155; }

        .note-box{
          margin-top:18px;
          background:#fff7ed;
          border:1px solid #fce9c8;
          padding:12px;
          border-radius:8px;
          color:#663c00;
        }

        /* Conditions card */
        .conditions-grid{
          display:grid;
          grid-template-columns: 1fr 1fr;
          gap:14px;
          margin-top:12px;
        }
        .condition-item{
          display:flex;
          align-items:center;
          justify-content:space-between;
          background:#ffffff;
          border-radius:10px;
          padding:14px 16px;
          border:1px solid #eef2f8;
          box-shadow:0 1px 4px rgba(12,38,86,0.03);
          box-sizing:border-box;
        }
        .condition-content{ text-align:right; margin-left:12px; flex:1; }
        .condition-title{ font-size:15px; color:var(--title); margin-bottom:6px; font-weight:600; }
        .condition-desc{ color:var(--muted); font-size:13px; line-height:1.45; }
        .condition-icon{
          width:46px;
          height:46px;
          border-radius:12px;
          background:#f1f5f9;
          display:flex;
          align-items:center;
          justify-content:center;
          flex-shrink:0;
        }

        /* Documents card */
        .documents-grid{
          display:flex;
          gap:28px;
          align-items:flex-start;
          margin-top:8px;
          flex-wrap:wrap;
        }
        .left-column{ flex:2; padding-right:6px; min-width:220px; box-sizing:border-box; }
        .right-column{ flex:1; display:flex; flex-direction:column; gap:12px; align-items:stretch; min-width:220px; box-sizing:border-box; }
        .desc{ color:#475569; margin:18px 0; line-height:1.9; }

        .doc-item{
          background:#fffaf0;
          border-radius:10px;
          padding:12px 14px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          border-left:4px solid rgba(193,143,0,0.12);
          box-shadow: inset 0 0 0 1px rgba(226,210,168,0.06);
          box-sizing:border-box;
        }
        .doc-item.muted{ background:#f4f6f9; border-left:4px solid rgba(148,163,184,0.06); }
        .doc-item .content{ display:flex; gap:12px; align-items:center; flex:1; }
        .doc-item .text{ color:var(--title); font-size:15px; flex:1; text-align:right; }
        .badge{
          background: linear-gradient(180deg,#f6e6a8,#f1dc86);
          color:#7a5a00;
          padding:4px 10px;
          border-radius:999px;
          font-size:12px;
          font-weight:600;
          border:1px solid rgba(124,91,4,0.08);
          white-space:nowrap;
        }
        .badge-muted{
          background:#eef2f6;
          color:#475569;
          padding:4px 10px;
          border-radius:999px;
          font-size:12px;
          font-weight:600;
          border:1px solid rgba(148,163,184,0.06);
          white-space:nowrap;
        }
        .doc-icon{ margin-left:12px; display:flex; align-items:center; }

        /* Responsive rules */
        @media (max-width: 900px) {
          .card { padding: 18px; }
          .overview-grid { flex-direction: column; }
          .request-box { min-width: auto; width:100%; }
          .tracking-row { flex-direction: column; }
          .documents-grid { flex-direction: column; }
          .left-column, .right-column { min-width: auto; width:100%; }
          .conditions-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 520px) {
          .cards-root { padding: 12px; }
          .card { padding: 14px; border-radius: 10px; }
          h1 { font-size: 18px; }
          .lead { font-size: 13px; }
          .condition-icon { width:40px; height:40px; }
          .doc-item { padding:10px; }
          .badge, .badge-muted { padding: 3px 8px; font-size:11px; }
        }
      `}</style>

      {/* First card: overview */}
      <div className="card">
        <h1>نبذة عن نظام التكافل الاجتماعي</h1>

        <p className="lead">
          يهدف نظام التكافل الاجتماعي في جامعة حلوان إلى دعم الطلاب الذين يواجهون ظروفاً
          اقتصادية صعبة. يقدم النظام أنواعًا مختلفة من الدعم المالي والأكاديمي للطلاب المحتاجين،
          بما يضمن استمرارهم في التعليم وتحقيق أهدافهم الأكاديمية. يتم تقييم كل طلب بعناية من
          قبل لجنة متخصصة لضمان وصول الدعم لمن يستحقه فعلاً.
        </p>

        <div className="overview-grid">
          <div className="info-card">
            <h3>أنواع الدعم المتاحة</h3>
            <ul>
              <li>• الدعم المالي الشهري</li>
              <li>• دعم الرسوم الدراسية</li>
              <li>• الدعم الطبي والعلاجي</li>
              <li>• دعم الطوارئ</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>مبالغ الدعم</h3>
            <ul>
              <li>• الدعم الشهري: 300-800 جنيه</li>
              <li>• دعم الرسوم: حسب الكلية</li>
              <li>• الدعم الطبي: حسب الحالة</li>
              <li>• دعم الطوارئ: حتى 2000 جنيه</li>
            </ul>
          </div>
        </div>

        <hr className="separator" />

        <h2 className="subtitle">تتبع طلبك ورقم المرجع</h2>

        <div className="tracking-row">
          <div className="box" style={{ flex: 1 }}>
            <h4 className="box-title">مراحل المعالجة:</h4>
            <ul className="small-list">
              <li>• تم التقديم: الطلب مستلم بنجاح</li>
              <li>• قيد المراجعة: يتم دراسة الطلب</li>
              <li>• النتيجة النهائية: موافقة أو رفض</li>
            </ul>
          </div>

          <div className="box request-box">
            <h4 className="box-title">رقم الطلب:</h4>
            <p style={{ margin: "8px 0" }}>
              ستحصل على رقم طلب فريد بصيغة SS-2025-XXX — احتفظ بهذا الرقم للمتابعة والاستعلام.
            </p>

            <p style={{ marginTop: 8, color: "#475569", fontSize: 13 }}>
              احتفظ برقم الطلب للمتابعة والاستعلام. يمكنك البحث عن طلبك باستخدام هذا الرقم من
              خلال قسم "طلباتي" في بوابة الجامعة.
            </p>
          </div>
        </div>

        <div className="note-box">
          <strong>ملاحظة مهمة:</strong>
          <span style={{ marginInlineStart: 8 }}>
            يتم مراجعة جميع الطلبات خلال 7-10 أيام عمل. ستتلقى إشعاراً بالنتيجة عبر البريد
            الإلكتروني المسجل، كما يمكنك متابعة حالة طلبك في قسم "طلباتي".
          </span>
        </div>
      </div>

      {/* Conditions card (inserted between overview and documents) */}
      <div className="card">
        <h1>شروط الاستحقاق</h1>
        <p className="lead">يجب توفر الشروط التالية للحصول على الدعم المالي</p>

        <div className="conditions-grid">
          <div className="condition-item">
            <div className="condition-content">
              <div className="condition-title">الانتظام الأكاديمي</div>
              <div className="condition-desc">
                يجب أن يكون الطالب منتظماً في الدراسة بمعدل تراكمي لا يقل عن 2.0
              </div>
            </div>
            <div className="condition-icon" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b3f5c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3 6 6 .5-4.5 3.5L20 20l-8-5-8 5 1.5-7L1 8.5 7 8z"/>
              </svg>
            </div>
          </div>

          <div className="condition-item">
            <div className="condition-content">
              <div className="condition-title">الجنسية المصرية</div>
              <div className="condition-desc">يجب أن يكون الطالب مصري الجنسية</div>
            </div>
            <div className="condition-icon" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b3f5c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="14" rx="2"/>
                <path d="M7 21v-3a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3"/>
              </svg>
            </div>
          </div>

          <div className="condition-item">
            <div className="condition-content">
              <div className="condition-title">الدخل الشهري</div>
              <div className="condition-desc">يجب ألا يتجاوز إجمالي دخل الأسرة 3000 جنيه شهرياً</div>
            </div>
            <div className="condition-icon" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b3f5c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1v22"/>
                <path d="M5 5h14"/>
                <path d="M5 19h14"/>
              </svg>
            </div>
          </div>

          <div className="condition-item">
            <div className="condition-content">
              <div className="condition-title">وضع الأسرة</div>
              <div className="condition-desc">وفاة الأب أو إعاقته أو وجود ظروف اقتصادية صعبة</div>
            </div>
            <div className="condition-icon" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b3f5c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
                <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Documents card */}
      <div className="card">
        <h1>المستندات المطلوبة</h1>
        <p className="lead">المستندات اللازمة لتقديم طلب الدعم المالي</p>

        <div className="documents-grid">
          {/* Left column: detailed descriptions */}
          <div className="left-column">
            <p className="desc">
              بحث اجتماعي معتمد من وحدة التضامن الاجتماعي بالجامعة أو المنطقة
            </p>
            <p className="desc">
              مفردات راتب حديثة أو شهادة معاش أو إفادة دخل معتمدة من جهة العمل
            </p>
            <p className="desc">صورة واضحة من وجهي البطاقة الشخصية للوالد أو ولي الأمر</p>
            <p className="desc">صورة واضحة من وجهي البطاقة الشخصية للطالب المتقدم للدعم</p>
            <p className="desc">
              شهادة حيازة زراعية أو ملكية أرض زراعية للمقيمين في المحافظات (إن وُجدت)
            </p>
            <p className="desc">
              صورة بطاقة تكافل وكرامة  (إن وُجدت)
            </p>
          </div>

          {/* Right column: compact list with badges and icons */}
          <div className="right-column">
            <div className="doc-item">
              <div className="content">
                <div className="text">بحث اجتماعي من وحدة التضامن الاجتماعي</div>
                <span className="badge">مطلوب</span>
              </div>
              <div className="doc-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <path d="M14 2v6h6"/>
                </svg>
              </div>
            </div>

            <div className="doc-item">
              <div className="content">
                <div className="text">مفردات المرتب أو المعاش أو ما يفيد بالدخل</div>
                <span className="badge">مطلوب</span>
              </div>
              <div className="doc-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <path d="M14 2v6h6"/>
                </svg>
              </div>
            </div>

            <div className="doc-item">
              <div className="content">
                <div className="text">صورة البطاقة الشخصية للوالد (أو ولي الأمر)</div>
                <span className="badge">مطلوب</span>
              </div>
              <div className="doc-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <path d="M14 2v6h6"/>
                </svg>
              </div>
            </div>

            <div className="doc-item">
              <div className="content">
                <div className="text">صورة البطاقة الشخصية للطالب</div>
                <span className="badge">مطلوب</span>
              </div>
              <div className="doc-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <path d="M14 2v6h6"/>
                </svg>
              </div>
            </div>

            <div className="doc-item muted">
              <div className="content">
                <div className="text">حيازة زراعية لسكان الأقاليم</div>
                <span className="badge-muted">إن وُجدت</span>
              </div>
              <div className="doc-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7v13a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7"/>
                  <path d="M7 3h10l4 4H3l4-4z"/>
                </svg>
              </div>
            </div>
          
           <div className="doc-item muted">
              <div className="content">
              صورة بطاقة تكافل وكرامة
                <div className="text"></div>
                <span className="badge-muted">إن وُجدت</span>
              </div>
              <div className="doc-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7v13a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7"/>
                  <path d="M7 3h10l4 4H3l4-4z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}