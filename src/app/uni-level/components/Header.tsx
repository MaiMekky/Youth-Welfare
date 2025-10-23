import "../styles/Header.css";

export default function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <div className="logo-icon">🏠</div>
        </div>
        <div className="header-title">
          <h1>ادارة التكافل الاجتماعي</h1>
          <p>جامعة حلوان</p>
        </div>
      </div>
    </header>
  );
}
