"use client";
import React from "react";
import "../Styles/Footer.css";
import { MapPin, Phone, Mail, Globe, Users, Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">

      <div className="footerTop">

        {/* Col 1: جامعة حلوان */}
        <div className="footerCol">
          <div className="brandBlock">
            <div className="brandIcon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
              </svg>
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
            <li>إدارة اتحادات الطلاب</li>
          </ul>
        </div>

        {/* Col 4: معلومات التواصل */}
        <div className="footerCol">
          <div className="colTitle">معلومات التواصل</div>
          <ul className="contactList">
            <li><MapPin size={14} /><span>إدارة رعاية الطلاب<br/>جامعة العاصمة - عين حلوان</span></li>
            <li><Phone size={14} /><span>(202+) 2556-0000</span></li>
            <li><Mail size={14} /><span>youth@helwan.edu.eg</span></li>
            <li><Globe size={14} /><span>www.helwan.edu.eg</span></li>
          </ul>
          <div className="socialRow">
            <span className="socialLabel">تابعونا</span>
            <div className="socialIcons">
              <a href="#" className="socialBtn"><Facebook size={16} /></a>
              <a href="#" className="socialBtn"><Twitter size={16} /></a>
              <a href="#" className="socialBtn"><Instagram size={16} /></a>
            </div>
          </div>
        </div>

      </div>

      {/* Stats bar */}
      <div className="footerStats">
        <div className="statItem"><span className="statNum">+24</span><span className="statLbl">كلية </span></div>
        <div className="statItem"><span className="statNum">+180K</span><span className="statLbl">طالب وطالبة</span></div>
        <div className="statItem"><span className="statNum">100</span><span className="statLbl">عام من التميز</span></div>
        <div className="statItem"><span className="statNum">3</span><span className="statLbl">فروع جامعية</span></div>
      </div>

    </footer>
  );
}