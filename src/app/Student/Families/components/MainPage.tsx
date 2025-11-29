'use client';
import React, { useState } from 'react';
import { X } from 'lucide-react';
import '../styles/mainpage.css'; 

export default function MainPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    id: '',
    address: '',
    mobile: ''
  });

  const programs = [
    {
      id: 1,
      title: 'أسرة التطوع',
      subtitle: 'أسرتنا تهتم بمشاركتك وخدمتك للمجتمع وتطويره والنهوض',
      image: '/api/placeholder/300/200',
      color: 'red',
      views: '18/25',
      date: '15 يناير 2025',
     
    },
    {
      id: 2,
      title: 'أسرة الوعي الصحي',
      subtitle: 'أسرتنا المتخصصة في النشاط الصحية والتثقيف الصحي المختلف',
      image: '/api/placeholder/300/200',
      color: 'green',
      views: '23/30',
      date: '15 يناير 2025',
    
    },
    {
      id: 3,
      title: 'أسرة المهنيين',
      subtitle: 'أسرة مهتمة بتطوير المهارات والمعرفة بالتقنيات والحرف',
      image: '/api/placeholder/300/200',
      color: 'blue',
      views: '15/25',
      date: '27 يناير 2025',
    
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.id || !formData.address || !formData.mobile) {
      alert('يرجى ملء جميع الحقول');
      return;
    }
    console.log('Form submitted:', formData);
    setFormData({ name: '', id: '', address: '', mobile: '' });
    setIsModalOpen(false);
    alert('تم تسجيلك بنجاح');
  };

  return (
    <div dir="rtl" className="container">
      {/* Header */}
      <header className="header">
        <h1>الأسر الحالية</h1>
       
      </header>

      {/* Notification */}
      <section className="notification">
        <div className="notification-content">
          <div>
            <h3>فرصة للانضمام للأسرة الذهبية</h3>
            <p>اضغط هنا للاطلاع على الفرص المتاحة والتسجيل معنا</p>
          </div>
          <img src="/api/placeholder/60/60" alt="icon" />
        </div>
      </section>

      {/* Programs Grid */}
      <main className="programs-grid">
        {programs.map(program => (
          <div key={program.id} className="program-card">
            <div className="program-image">
              <img src={program.image} alt={program.title} />
              <span style={{backgroundColor: program.color}} className="status">{program.status}</span>
            </div>
            <div className="program-content">
              <h3>{program.title}</h3>
              <p>{program.subtitle}</p>
              <div className="meta">
                <span>العدد: {program.views}</span>
                <span>التاريخ: {program.date}</span>
              </div>
              <button onClick={() => setIsModalOpen(true)}>انضم للاسرة</button>
            </div>
          </div>
        ))}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>الانضمام للأسرة</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <div className="modal-body">
              {['name','id','address','mobile'].map((field, idx) => (
                <div key={idx} className="form-group">
                  <label>
                    {field === 'name' ? 'الاسم' : field === 'id' ? 'الهوية / البطاقة' : field === 'address' ? 'العنوان' : 'رقم الجوال'}
                  </label>
                  <input
                    type={field === 'mobile' ? 'tel' : 'text'}
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    placeholder={`أدخل ${field === 'name' ? 'اسمك' : field === 'id' ? 'رقم هويتك' : field === 'address' ? 'عنوانك' : 'رقم جوالك'}`}
                  />
                </div>
              ))}
              <div className="modal-buttons">
                <button onClick={() => setIsModalOpen(false)}>إلغاء</button>
                <button onClick={handleSubmit}>تسجيل</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
