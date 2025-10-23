import "../styles/Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-right">
          <p>الإصدار: 1.0.9</p>
          <p>solidarity@helwan.edu.eg :البريد الإلكتروني</p>
          <p>© منصة التكافل الاجتماعي - جامعة حلوان - جميع الحقوق محفوظة</p>
        </div>
        <div className="footer-left">
          <div className="footer-logo">Helwan</div>
          <div className="social-links">
            <span>مكتب الدعم</span>
            <span>Social Support Administration</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
