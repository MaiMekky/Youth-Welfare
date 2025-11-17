import "../styles/SummaryCard.css";

interface Props {
  totalRequests: number;
  totalAmount: string;
}

export default function SummaryCard({ totalRequests, totalAmount }: Props) {
  return (
    <div className="summary-card">
      <div className="summary-icon">👤</div>
      <div className="summary-info">
        <div className="label">عدد الطلبات</div>
        <div className="value">{totalRequests}</div>
      </div>
      <div className="summary-total">
        <div className="label">الإجمالي الكلية</div>
        <div className="value">{totalAmount}</div>
      </div>
      <button className="export-btn">📄</button>
    </div>
  );
}
