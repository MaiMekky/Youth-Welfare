import "../styles/Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footerContainer">
        <div className="footerLeft">
          <div className="footerLogo">Helwan</div>
          <div className="footerText">
            <span>مكتب الدعم</span>
            <span>Social Support Administration</span>
          </div>
        </div>
        <div className="footerRight">
          <p>الإصدار: 1.0.9</p>
          <p>البريد الإلكتروني: solidarity@helwan.edu.eg</p>
          <p>© منصة التكافل الاجتماعي - جامعة حلوان - جميع الحقوق محفوظة</p>
        </div>
      </div>
    </footer>
  );
}
