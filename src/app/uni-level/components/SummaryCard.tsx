import "../styles/SummaryCard.css";


interface Props {
  totalRequests: number;
  totalAmount: string;
  pending?: number;
  accepted?: number;
  rejected?: number;
}
 
export default function SummaryCard({
  totalRequests,
  totalAmount,
  pending,
  accepted,
  rejected,
}: Props) {

  return (
    <div className="summary-grid">
 
      {/* Card 1 — navy gradient (total) */}
      <div className="summary-card summary-total-card">
        <div className="summary-num">{totalRequests}</div>
        <div className="summary-label">إجمالي الطلبات</div>
      </div>
 
      {/* Card 2 — amber (منتظر) */}
      <div className="summary-card summary-pending-card">
        <div className="summary-num">{pending}</div>
        <div className="summary-label">منتظر</div>
      </div>
 
      {/* Card 3 — green (مقبول) */}
      <div className="summary-card summary-accepted-card">
        <div className="summary-num">{accepted}</div>
        <div className="summary-label">مقبول</div>
      </div>
 
      {/* Card 4 — red (مرفوض) */}
      <div className="summary-card summary-rejected-card">
        <div className="summary-num">{rejected}</div>
        <div className="summary-label">مرفوض</div>
      </div>

      <div className="summary-card summary-total">
        <div className="summary-num">{totalAmount}</div>
        <div className="summary-label">إجمالي المبالغ</div>     
      </div>

      {/* <button className="export-btn">تصدير</button> */}
    </div>
  );
}
