"use client";
import React, { useState } from 'react';
import './Events.css';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  seats: number;
  duration: string;
  category: string;
  type: 'university' | 'college';
  image: string;
  status: 'available' | 'registered' | 'full';
}

const EVENTS: Event[] = [
  { id:1, title:'دوري كرة القدم الجامعي',     description:'منافسات رياضية بين كليات الجامعة في بطولة كرة القدم السنوية', date:'25 ديسمبر 2024', location:'الملاعب الرياضية',  seats:25, duration:'2 ساعة', category:'social',     type:'university', image:'/api/placeholder/400/250', status:'available'  },
  { id:2, title:'أمسية ثقافية فنية',           description:'أمسية ثقافية تضم عروض فنية ومسرحية ومعارض للطلاب المبدعين', date:'20 ديسمبر 2024', location:'المركز الثقافي',  seats:25, duration:'2 ساعة', category:'cultural',   type:'university', image:'/api/placeholder/400/250', status:'available'  },
  { id:3, title:'ورشة التطوير المهني',          description:'ورشة تدريبية شاملة لتطوير المهارات المهنية والشخصية للطلاب', date:'15 ديسمبر 2024', location:'المدرج الرئيسي', seats:25, duration:'2 ساعة', category:'scientific', type:'college',    image:'/api/placeholder/400/250', status:'registered' },
  { id:4, title:'معرض الفنون والإبداع',         description:'معرض سنوي يعرض أعمال الطلاب الفنية في مجالات متعددة',     date:'10 ديسمبر 2024', location:'قاعة المعارض',  seats:50, duration:'3 ساعات', category:'artistic', type:'university', image:'/api/placeholder/400/250', status:'available'  },
  { id:5, title:'رحلة الإسكندرية التطوعية',    description:'رحلة خدمة مجتمعية وتطوعية للطلاب المشاركين في الجوالة',    date:'5 ديسمبر 2024',  location:'الإسكندرية',    seats:30, duration:'يوم كامل', category:'volunteer', type:'college', image:'/api/placeholder/400/250', status:'available'  },
  { id:6, title:'ندوة الاتحادات الطلابية',      description:'ندوة لمناقشة دور الاتحادات الطلابية وتطوير العمل التطوعي',  date:'1 ديسمبر 2024',  location:'قاعة الاجتماعات', seats:60, duration:'ساعتان', category:'unions', type:'university', image:'/api/placeholder/400/250', status:'available'  },
];

const CATEGORIES = [
  { id:'all',       name:'جميع الفعاليات',       count:12 },
  { id:'social',    name:'النشاط الاجتماعي',     count:2  },
  { id:'scientific',name:'النشاط العلمي',         count:4  },
  { id:'volunteer', name:'الجوالة والخدمة',       count:2  },
  { id:'unions',    name:'الاتحادات الطلابية',    count:1  },
  { id:'artistic',  name:'النشاط الفني',          count:1  },
  { id:'cultural',  name:'النشاط الثقافي',        count:1  },
];

const CATEGORY_LABELS: Record<string, string> = {
  social:'النشاط الاجتماعي', scientific:'النشاط العلمي',
  cultural:'النشاط الثقافي', artistic:'النشاط الفني',
  volunteer:'الجوالة', unions:'الاتحادات',
};

const BADGE_CLASS: Record<string, string> = {
  social:'badge-social', scientific:'badge-scientific', volunteer:'badge-volunteer',
  cultural:'badge-cultural', artistic:'badge-artistic', unions:'badge-unions',
};

// SVG icons
const CalendarIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const PinIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const UsersIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const ClockIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const CheckIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const UploadIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

export default function Events() {
  const [activeCat,  setActiveCat]  = useState('all');
  const [activeType, setActiveType] = useState('all');
  const [drawerEvent, setDrawerEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    studentNumber:'', fullName:'', email:'', phone:'',
    faculty:'', academicYear:'', notes:'',
    universityId: null as File | null,
  });

  const filtered = EVENTS.filter(e => {
    const catMatch  = activeCat  === 'all' || e.category === activeCat;
    const typeMatch = activeType === 'all' || e.type     === activeType;
    return catMatch && typeMatch;
  });

  const openDrawer  = (e: Event)  => setDrawerEvent(e);
  const closeDrawer = ()          => setDrawerEvent(null);

  const handleSubmit = () => {
    console.log('Submitted:', formData);
    closeDrawer();
    setFormData({ studentNumber:'', fullName:'', email:'', phone:'', faculty:'', academicYear:'', notes:'', universityId: null });
  };

  return (
    <div className="events-page" dir="rtl">

      {/* ══ HERO HEADER ══ */}
      <div className="events-hero">
        <div className="hero-inner">
          <div className="hero-text">
            <h1 className="hero-title">جميع الأنشطة والفعاليات</h1>
            <p className="hero-sub">استكشف الفعاليات والأنشطة المتاحة وسجّل في ما يناسبك</p>
          </div>
          <span className="hero-count">{filtered.length} فعالية</span>
        </div>

        {/* Category filters as tabs inside hero */}
        <div className="hero-filters">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`filter-pill${activeCat === cat.id ? ' active' : ''}`}
              onClick={() => setActiveCat(cat.id)}
            >
              {cat.name}
              <span className="pill-count">{cat.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ══ TYPE BAR ══ */}
      <div className="type-bar">
        <div className="type-toggle">
          {[
            { id:'all',        label:'الكل' },
            { id:'university', label:'فعاليات الجامعة' },
            { id:'college',    label:'فعاليات الكلية'  },
          ].map(t => (
            <button
              key={t.id}
              className={`type-btn${activeType === t.id ? ' active' : ''}`}
              onClick={() => setActiveType(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══ BODY ══ */}
      <div className="events-body">
        <div className="results-bar">
          <span className="results-label">عرض <strong>{filtered.length}</strong> فعالية</span>
        </div>

        <div className="events-grid">
          {filtered.length === 0 && (
            <div className="empty-state">
              <p>لا توجد فعاليات تطابق الفلتر المحدد</p>
            </div>
          )}

          {filtered.map(event => (
            <div key={event.id} className="event-card">
              {/* Image */}
              <div className="event-image">
                <img src={event.image} alt={event.title} />
                <span className={`event-badge ${BADGE_CLASS[event.category] || ''}`}>
                  {CATEGORY_LABELS[event.category] || event.category}
                </span>
                {event.status === 'registered' && (
                  <span className="status-badge">تم التسجيل</span>
                )}
                <span className={`type-badge ${event.type}`}>
                  {event.type === 'university' ? 'متاح للتسجيل' : 'فعالية الكلية'}
                </span>
              </div>

              {/* Content */}
              <div className="event-content">
                <h3 className="event-title">{event.title}</h3>
                <p className="event-description">{event.description}</p>

                <div className="event-meta">
                  <div className="meta-item"><CalendarIcon />{event.date}</div>
                  <div className="meta-item"><PinIcon />{event.location}</div>
                  <div className="meta-item"><UsersIcon />{event.seats} مقعد</div>
                  <div className="meta-item"><ClockIcon />{event.duration}</div>
                </div>

                {event.status === 'registered' ? (
                  <button className="register-btn registered-btn">
                    <CheckIcon /> تم التسجيل مسبقاً
                  </button>
                ) : (
                  <button className="register-btn" onClick={() => openDrawer(event)}>
                    التسجيل في النشاط
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ REGISTRATION DRAWER ══ */}
      {drawerEvent && (
        <>
          <div className="drawer-overlay" onClick={closeDrawer} />
          <div className="drawer">
            {/* Drawer header */}
            <div className="drawer-header">
              <button className="drawer-close" onClick={closeDrawer}>×</button>
              <p className="drawer-event-title">{drawerEvent.title}</p>
              <p className="drawer-event-meta">{drawerEvent.date} · {drawerEvent.location}</p>
            </div>

            {/* Drawer body */}
            <div className="drawer-body">
              <div className="reg-form">

                <p className="drawer-section">البيانات الشخصية</p>

                <div className="reg-row">
                  <div className="reg-group">
                    <label>رقم الطالب *</label>
                    <input type="text" placeholder="أدخل رقم الطالب"
                      value={formData.studentNumber}
                      onChange={e => setFormData({...formData, studentNumber: e.target.value})} />
                  </div>
                  <div className="reg-group">
                    <label>الاسم الكامل *</label>
                    <input type="text" placeholder="أدخل اسمك بالكامل"
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})} />
                  </div>
                </div>

                <div className="reg-row">
                  <div className="reg-group">
                    <label>البريد الإلكتروني *</label>
                    <input type="email" placeholder="i@student.university.edu.eg"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="reg-group">
                    <label>رقم الهاتف *</label>
                    <input type="tel" placeholder="01XXXXXXXXX"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>

                <div className="reg-row">
                  <div className="reg-group">
                    <label>الكلية *</label>
                    <select value={formData.faculty}
                      onChange={e => setFormData({...formData, faculty: e.target.value})}>
                      <option value="">اختر الكلية</option>
                      <option value="engineering">كلية الهندسة</option>
                      <option value="science">كلية العلوم</option>
                      <option value="arts">كلية الآداب</option>
                      <option value="commerce">كلية التجارة</option>
                    </select>
                  </div>
                  <div className="reg-group">
                    <label>السنة الدراسية *</label>
                    <select value={formData.academicYear}
                      onChange={e => setFormData({...formData, academicYear: e.target.value})}>
                      <option value="">اختر السنة</option>
                      <option value="1">الأولى</option>
                      <option value="2">الثانية</option>
                      <option value="3">الثالثة</option>
                      <option value="4">الرابعة</option>
                    </select>
                  </div>
                </div>

                <p className="drawer-section">المستندات</p>

                <div className="reg-group">
                  <label>صورة الهوية الجامعية *</label>
                  <div className="file-drop">
                    <label className="file-drop-label" htmlFor="uniId">
                      <UploadIcon />
                      <span>{formData.universityId ? formData.universityId.name : 'اضغط لرفع الهوية الجامعية'}</span>
                    </label>
                    <input id="uniId" type="file" accept="image/*,.pdf"
                      onChange={e => setFormData({...formData, universityId: e.target.files?.[0] || null})}
                      style={{ display:'none' }} />
                  </div>
                </div>

                <p className="drawer-section">ملاحظات</p>

                <div className="reg-group">
                  <label>طلبات خاصة أو ملاحظات</label>
                  <textarea placeholder="أي طلبات خاصة تريد إضافتها..." rows={3}
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})} />
                </div>

              </div>
            </div>

            {/* Drawer footer */}
            <div className="drawer-footer">
              <button className="btn-cancel" onClick={closeDrawer}>إلغاء</button>
              <button className="btn-submit" onClick={handleSubmit}>تأكيد التسجيل</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}