"use client";
import React from "react";
import "../styles/Footer.css";
import { MapPin, Phone, Mail, Globe, Users, Facebook, Twitter, Instagram } from "lucide-react";
import capitalLogo from "../../assets/capital-uni-logo.png";

export default function Footer() {
  return (
    <footer className="footer">

      <div className="footerTop">

        {/* Col 1: جامعة حلوان */}
        <div className="footerCol">
          <div className="brandBlock">
            <div className="brandIcon">
              <img src={capitalLogo.src} alt="Capital University Logo" width="70" height="70" draggable={false} />
            </div>
            <div>
              <div className="brandName">جامعة العاصمة</div>
              <div className="brandSub">Capital University</div>
            </div>
          </div>
          <p className="brandDesc">
            جامعة مصرية حكومية تأسست عام 1975، تضم العديد من الكليات والمعاهد المتخصصة في مختلف المجالات العلمية والتطبيقية
          </p>
          <div className="brandMeta">
            <div className="metaRow"><MapPin size={14} /><span>عين حلوان، القاهرة، جمهورية مصر العربية</span></div>
            <div className="metaRow"><Users size={14} /><span>أكثر من 180,000 طالب وطالبة</span></div>
          </div>
        </div>

        {/* Col 2: نظام إدارة شؤون الشباب */}
        <div className="footerCol">
          <div className="colTitle">نظام إدارة شؤون الطلاب</div>
          <p className="colDesc">المنصة الرقمية الموحدة لإدارة الأنشطة الطلابية والشبابية بجامعة العاصمة</p>
          {/* <ul className="colListIcon">
            <li><Users size={13} /><span>النظرة العامة</span></li>
            <li><Users size={13} /><span>إدارة الفعاليات</span></li>
            <li><Users size={13} /><span>إدارة المدراء</span></li>
            <li><Users size={13} /><span>تقارير الكليات</span></li>
          </ul> */}
        </div>

        {/* Col 3: إدارات رعاية الشباب */}
        <div className="footerCol">
          <div className="colTitle">إدارات رعاية الشباب</div>
          <ul className="colListPlain">
            <li>إدارة الأنشطة الرياضية</li>
            <li>إدارة الأنشطة الاجتماعية</li>
            <li>إدارة الكشافة والخدمة العامة</li>
            <li>إدارة الأنشطة الفنية</li>
            <li>إدارة الأنشطة الثقافية</li>
            <li>إدارة الأنشطة العلمية</li>
            <li>إدارة التضامن الاجتماعي</li>
          </ul>
        </div>



      </div>

      {/* Stats bar
      <div className="footerStats">
        <div className="statItem"><span className="statNum">+24</span><span className="statLbl">كلية </span></div>
        <div className="statItem"><span className="statNum">+180K</span><span className="statLbl">طالب وطالبة</span></div>
        <div className="statItem"><span className="statNum">100</span><span className="statLbl">عام من التميز</span></div>
        <div className="statItem"><span className="statNum">3</span><span className="statLbl">فروع جامعية</span></div>
      </div> */}

    </footer>
  );
}