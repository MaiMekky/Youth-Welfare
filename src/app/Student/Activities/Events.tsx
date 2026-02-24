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

const Events: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeType, setActiveType] = useState<string>('all');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    studentNumber: '',
    fullName: '',
    email: '',
    phone: '',
    faculty: '',
    academicYear: '',
    universityId: null as File | null,
    additionalDocs: [] as File[]
  });

  const events: Event[] = [
    {
      id: 1,
      title: 'دوري كرة القدم الجامعي',
      description: 'منافسات رياضية بين كليات الجامعة في بطولة كرة القدم السنوية',
      date: '25 ديسمبر 2024',
      location: 'الملاعب الرياضية',
      seats: 25,
      duration: '2 ساعة',
      category: 'social',
      type: 'university',
      image: '/api/placeholder/400/250',
      status: 'available'
    },
    {
      id: 2,
      title: 'أمسية ثقافية فنية',
      description: 'أمسية ثقافية تضم عروض فنية ومسرحية ومعارض للطلاب المبدعين',
      date: '20 ديسمبر 2024',
      location: 'المركز الثقافي',
      seats: 25,
      duration: '2 ساعة',
      category: 'cultural',
      type: 'university',
      image: '/api/placeholder/400/250',
      status: 'available'
    },
    {
      id: 3,
      title: 'ورشة عمل التطوير المهني',
      description: 'ورشة تدريبية شاملة لتطوير المهارات المهنية والشخصية للطلاب',
      date: '15 ديسمبر 2024',
      location: 'المدرج الرئيسي',
      seats: 25,
      duration: '2 ساعة',
      category: 'scientific',
      type: 'college',
      image: '/api/placeholder/400/250',
      status: 'registered'
    }
  ];

  const categories = [
    { id: 'all', name: 'جميع الفعاليات', count: 12 },
    { id: 'social', name: 'النشاط الاجتماعي', count: 2 },
    { id: 'scientific', name: 'النشاط العلمي', count: 4 },
    { id: 'volunteer', name: 'الجوالة والخدمة العامة', count: 2 },
    { id: 'unions', name: 'الاتحادات الطلابية', count: 1 },
    { id: 'artistic', name: 'النشاط الفني', count: 1 },
    { id: 'cultural', name: 'النشاط الثقافي', count: 1 }
  ];

  const types = [
    { id: 'all', name: 'جميع الفعاليات', count: 12 },
    { id: 'university', name: 'فعاليات الجامعة', count: 8 },
    { id: 'college', name: 'فعاليات الكلية', count: 4 }
  ];

  const filteredEvents = events.filter(event => {
    const categoryMatch = activeCategory === 'all' || event.category === activeCategory;
    const typeMatch = activeType === 'all' || event.type === activeType;
    return categoryMatch && typeMatch;
  });

  const handleRegister = (event: Event) => {
    setSelectedEvent(event);
    setShowRegistrationModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const files = e.target.files;
    if (!files) return;

    if (field === 'universityId') {
      setFormData({ ...formData, universityId: files[0] });
    } else if (field === 'additionalDocs') {
      setFormData({ ...formData, additionalDocs: Array.from(files) });
    }
  };

  const handleSubmitRegistration = () => {
    // Handle registration submission
    console.log('Registration submitted:', formData);
    setShowRegistrationModal(false);
    // Reset form
    setFormData({
      studentNumber: '',
      fullName: '',
      email: '',
      phone: '',
      faculty: '',
      academicYear: '',
      universityId: null,
      additionalDocs: []
    });
  };

  const getCategoryBadgeClass = (category: string) => {
    const badges: { [key: string]: string } = {
      social: 'badge-social',
      scientific: 'badge-scientific',
      volunteer: 'badge-volunteer',
      cultural: 'badge-cultural',
      artistic: 'badge-artistic',
      unions: 'badge-unions'
    };
    return badges[category] || 'badge-default';
  };

  return (
    <div className="events-container">
      <div className="events-header">
        <h1 className="events-title">تصفية الفعاليات حسب الإدارة</h1>
        <p className="events-subtitle">اختر الفعالية المناسبة لك من الفعاليات التي تم تنزيلها</p>
      </div>

      {/* Category Filters */}
      <div className="filters-section">
        <div className="filters-scroll">
          {categories.map(category => (
            <button
              key={category.id}
              className={`filter-btn ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              <span className="filter-name">{category.name}</span>
              <span className="filter-count">{category.count} فعالية</span>
            </button>
          ))}
        </div>
      </div>

      {/* Type Filters */}
      <div className="type-filters">
        <div className="type-filters-wrapper">
          <button
            className={`type-filter-btn ${activeType === 'all' ? 'active' : ''}`}
            onClick={() => setActiveType('all')}
          >
            جميع الفعاليات
          </button>
          <button
            className={`type-filter-btn ${activeType === 'university' ? 'active' : ''}`}
            onClick={() => setActiveType('university')}
          >
            فعاليات الجامعة
          </button>
          <button
            className={`type-filter-btn ${activeType === 'college' ? 'active' : ''}`}
            onClick={() => setActiveType('college')}
          >
            فعاليات الكلية
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="events-info">
        <p>عرض {filteredEvents.length} فعالية</p>
      </div>

      <div className="events-grid">
        {filteredEvents.map(event => (
          <div key={event.id} className="event-card">
            <div className="event-image">
              <img src={event.image} alt={event.title} />
              <span className={`event-badge ${getCategoryBadgeClass(event.category)}`}>
                {event.category === 'social' && 'النشاط الاجتماعي'}
                {event.category === 'scientific' && 'النشاط العلمي'}
                {event.category === 'cultural' && 'النشاط الثقافي'}
                {event.category === 'artistic' && 'النشاط الفني'}
                {event.category === 'volunteer' && 'الجوالة'}
                {event.category === 'unions' && 'الاتحادات'}
              </span>
              {event.status === 'registered' && (
                <span className="status-badge registered">تم التسجيل</span>
              )}
              {event.type === 'university' && (
                <span className="type-badge university">متاح للتسجيل</span>
              )}
              {event.type === 'college' && (
                <span className="type-badge college">النشاط الثقافي</span>
              )}
            </div>

            <div className="event-content">
              <h3 className="event-title">{event.title}</h3>
              <p className="event-description">{event.description}</p>

              <div className="event-details">
                <div className="event-detail">
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span>{event.date}</span>
                </div>

                <div className="event-detail">
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>{event.location}</span>
                </div>

                <div className="event-detail">
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <span>{event.seats} مقعد متاح</span>
                </div>

                <div className="event-detail">
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>{event.duration}</span>
                </div>
              </div>

              {event.status === 'registered' ? (
                <button className="register-btn registered-btn">
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  تسجيل بالفعل
                </button>
              ) : (
                <button 
                  className="register-btn"
                  onClick={() => handleRegister(event)}
                >
                  التسجيل في النشاط
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Registration Modal */}
      {showRegistrationModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowRegistrationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowRegistrationModal(false)}>
              ×
            </button>

            <h2 className="modal-title">التسجيل في: {selectedEvent.title}</h2>
            <p className="modal-subtitle">
              يرجى ملء البيانات المطلوبة للتسجيل في هذا النشاط. جميع الحقول المعروفة بعلامة (*) مطلوبة
            </p>

            <form className="registration-form">
              <h3 className="form-section-title">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                البيانات الشخصية
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label>رقم الطالب *</label>
                  <input
                    type="text"
                    placeholder="أدخل رقم الطالب"
                    value={formData.studentNumber}
                    onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>الاسم الكامل *</label>
                  <input
                    type="text"
                    placeholder="أدخل اسمك بالكامل"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>البريد الإلكتروني *</label>
                  <input
                    type="email"
                    placeholder="i@student.helwan.edu.eg"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>رقم الهاتف *</label>
                  <input
                    type="tel"
                    placeholder="01xxxxxxxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>الكلية *</label>
                  <select
                    value={formData.faculty}
                    onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                  >
                    <option value="">اختر الكلية</option>
                    <option value="engineering">كلية الهندسة</option>
                    <option value="science">كلية العلوم</option>
                    <option value="arts">كلية الآداب</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>السنة الدراسية *</label>
                  <select
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  >
                    <option value="">اختر السنة الدراسية</option>
                    <option value="1">السنة الأولى</option>
                    <option value="2">السنة الثانية</option>
                    <option value="3">السنة الثالثة</option>
                    <option value="4">السنة الرابعة</option>
                  </select>
                </div>
              </div>

              <h3 className="form-section-title">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                  <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
                المستندات المطلوبة
              </h3>

              <div className="form-group file-upload">
                <label>صورة الهوية الجامعية *</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="universityId"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, 'universityId')}
                  />
                  <label htmlFor="universityId" className="file-input-label">
                    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    اضغط لرفع صورة الهوية الجامعية
                  </label>
                  {formData.universityId && (
                    <p className="file-name">{formData.universityId.name}</p>
                  )}
                </div>
              </div>

              <div className="form-group file-upload">
                <label>مستندات إضافية (اختيارية)</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="additionalDocs"
                    multiple
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, 'additionalDocs')}
                  />
                  <label htmlFor="additionalDocs" className="file-input-label">
                    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    اضغط لرفع مستندات إضافية
                  </label>
                  {formData.additionalDocs.length > 0 && (
                    <p className="file-name">
                      {formData.additionalDocs.length} ملف محدد
                    </p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>طلبات خاصة أو ملاحظات</label>
                <textarea
                  placeholder="أي طلبات خاصة أو ملاحظات تريد إضافتها..."
                  rows={4}
                ></textarea>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowRegistrationModal(false)}
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  className="btn-submit"
                  onClick={handleSubmitRegistration}
                >
                  تأكيد التسجيل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;