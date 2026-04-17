import "../styles/Toolbar.css";

export default function Toolbar() {
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <button className="filter-btn">
          <span>التقارير والتحليل</span> <span className="icon">▼</span>
        </button>

        <div className="search-box">
          <input type="text" placeholder="البحث بواسطة الرقم أو الاسم أو رقم الطلب..." />
          <span className="search-icon"></span>
        </div>
      </div>

      
    </div>
  );
}
