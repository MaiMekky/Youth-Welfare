import "../styles/Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <div className="footer-logo">Helwan</div>
          <div className="footer-text">
            <span>مكتب الدعم</span>
            <span>Social Support Administration</span>
          </div>
        </div>

        <div className="footer-right">
          <p>الإصدار: 1.0.9</p>
          <p>البريد الإلكتروني: solidarity@helwan.edu.eg</p>
          <p>© منصة التكافل الاجتماعي - جامعة حلوان - جميع الحقوق محفوظة</p>
        </div>
      </div>
    </footer>
  );
}
