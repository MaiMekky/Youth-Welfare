import "../styles/PageHeader.css";

export default function PageHeader() {
  return (
    <div className="page-header">
      <h2>الطلبات المعتمدة على مستوى الجامعة</h2>
      <p className="breadcrumb">عرض وإدارة طلبات الدفع المقدمة والمعتمدة من الكليات</p>
      <p className="subtext">جميع الطلبات الموضحة أدناه تحتاج لمراجعة وإتمام الخطوات المحاسبية</p>
    </div>
  );
}
