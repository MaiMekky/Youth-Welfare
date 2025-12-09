'use client';
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import '../styles/mainpage.css';

interface MainPageProps {
  onViewFamilyDetails?: (family: any) => void;
}

export default function MainPage(props: MainPageProps = {}) {
  const { onViewFamilyDetails } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Load joined families from localStorage or use default
  const loadJoinedFamilies = (): any[] => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('joinedFamilies');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing joinedFamilies from localStorage', e);
        }
      }
    }
    // Default family
    return [
      {
        id: 100,
        title: 'أسرة الرواد الرياضيين',
        subtitle: 'أسرة متخصصة في الأنشطة الرياضية والتنافس الشريف',
        place: 'الصالة الرياضية',
        views: '22/30 عضو',
        createdAt: '2020',
        deadline: '15 يناير 2025',
        goals: 'تنظيم البطولات الرياضية، تدريب الفرق، نشر ثقافة الرياضة',
        image: '/api/placeholder/300/200'
      }
    ];
  };

  const [joinedFamilies, setJoinedFamilies] = useState<any[]>(loadJoinedFamilies);

  const [selectedFamily, setSelectedFamily] = useState<any>(null);

  interface FormData {
    name: string;
    id: string;
    level: string;
    address: string;
    studentId: string;
    mobile: string;
  }

  const [formData, setFormData] = useState<FormData>({
    name: '',
    id: '',
    level: '',
    address: '',
    studentId: '',
    mobile: ''
  });

  const programs = [
    {
      id: 100,
      title: 'أسرة الرواد الرياضيين',
      subtitle: 'أسرة متخصصة في الأنشطة الرياضية والتنافس الشريف',
      place: 'الصالة الرياضية',
      views: '22/30 عضو',
      deadline: '15 يناير 2025',
      goals: 'تنظيم البطولات الرياضية، تدريب الفرق، نشر ثقافة الرياضة',
      createdAt: '2020',
      description:
        'أسرة تهتم بتنمية مهارات الطلاب الرياضية وتنظيم مسابقات داخلية وخارجية.',
      image: '/api/placeholder/300/200'
    },
    {
      id: 1,
      title: 'أسرة التطوع',
      subtitle: 'أسرتنا تهتم بمشاركتك وخدمتك للمجتمع وتطويره والنهوض',
      image: '/api/placeholder/300/200',
      views: '18/25 عضو',
      date: '15 يناير 2025',
      place: 'مركز الأنشطة',
      goals: 'تنمية روح التطوع، دعم المجتمع، المساهمة في الأنشطة الخيرية',
      createdAt: '2018',
      description:
        'أسرة اجتماعية تهدف إلى تعزيز روح العطاء والتعاون والمشاركة المجتمعية.'
    },
    {
      id: 2,
      title: 'أسرة الوعي الصحي',
      subtitle: 'أسرتنا المتخصصة في النشاط الصحية والتثقيف الصحي المختلف',
      image: '/api/placeholder/300/200',
      views: '23/30 عضو',
      date: '15 يناير 2025',
      place: 'المبنى B',
      goals: 'التوعية الصحية – حملات تبرع – دعم الصحة النفسية',
      createdAt: '2019',
      description:
        'أسرة تثقيفية تهدف لرفع مستوى الوعي الصحي بين الطلاب وتنظيم حملات صحية.'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.id || !formData.address || !formData.mobile) {
      alert("يرجى ملء جميع الحقول");
      return;
    }

    // إضافة الأسرة المنضم لها لقائمة الأسَر الحالية
    const updatedFamilies = [...joinedFamilies, selectedFamily];
    setJoinedFamilies(updatedFamilies);
    
    // Save to localStorage to persist across navigation
    if (typeof window !== 'undefined') {
      localStorage.setItem('joinedFamilies', JSON.stringify(updatedFamilies));
    }

    setIsModalOpen(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2500);
  };
  // Reload joined families from localStorage when component mounts or when returning from details page
  useEffect(() => {
    const saved = localStorage.getItem('joinedFamilies');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setJoinedFamilies(parsed);
      } catch (e) {
        console.error('Error parsing joinedFamilies from localStorage', e);
      }
    }
  }, []);

  const isJoined = (id: number) => {
    return joinedFamilies.some(fam => fam.id === id);
  };


  return (
    <div dir="rtl" className="container">

      {/* Success Alert */}
      {showSuccess && (
        <div className="success-alert">
          <p>تم الانضمام للأسرة بنجاح 🎉</p>
        </div>
      )}

      {/* Joined Families Section */}
      <section className="joined-section">
        <header className="header">
          <h1>أسرك الحالية</h1>
        </header>
        <div className="gold-line"></div>

        {joinedFamilies.map(fam => (
          <div key={fam.id} className="joined-card">
            <h3>{fam.title}</h3>
            <p>{fam.subtitle}</p>

            <div className="joined-meta">
              <span>الأعضاء: {fam.views}</span>
            </div>

            <p><strong>المكان:</strong> {fam.place}</p>
            
            <button
              className="view-details-btn"
              onClick={() => {
                if (onViewFamilyDetails) {
                  onViewFamilyDetails(fam);
                }
              }}
            >
              عرض التفاصيل
            </button>
          </div>
        ))}
      </section>

      <header className="header">
        <h1>الأسر المتاحة للانضمام</h1>
      </header>
      <div className="gold-line"></div>

      {/* Programs */}
      <main className="programs-grid">
        {programs.map(program => (
          <div key={program.id} className="program-card">
            <div className="program-image">
              <img src={program.image} alt={program.title} />
            </div>

            <div className="program-content">
              <h3>{program.title}
              </h3>
              <span>
              <p className='goals-title'>وصف الاسرة : {program.subtitle} </p>
              <p className="goals-title"> الاهداف : {program.description}</p>
               <p className="goals-title">العدد الحالي : {program.views}</p>
               <p className="goals-title">المكان : {program.place}</p>
               </span>

              <div className="meta">
                <span>تاريخ انشاء الاسرة : {program.createdAt}</span>
              </div>
              <button
  disabled={isJoined(program.id)}
  className={isJoined(program.id) ? "joined-btn" : ""}
  onClick={() => {
    if (isJoined(program.id)) return; // حماية إضافية
    setSelectedFamily(program);
    setIsModalOpen(true);
  }}
>
  {isJoined(program.id) ? "منضم بالفعل" : "انضم للأسرة"}
</button>


     
            </div>
          </div>
        ))}
      </main>

      {/* Modal
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>طلب الانضمام لـ {selectedFamily?.title}</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div> */}

            {/* <div className="modal-body">
              {[
                { key: 'name', label: 'الاسم' },
                { key: 'id', label: 'رقم الهوية / البطاقة' },
                { key: 'level', label: 'الفرقة / المستوى' },
                { key: 'address', label: 'العنوان' },
                { key: 'studentId', label: 'كود الطالب' },
                { key: 'mobile', label: 'رقم الموبايل' }
              ].map((field, idx) => (
                <div key={idx} className="form-group">
                  <label>{field.label}</label>
                  <input
                    type={field.key === 'mobile' ? 'tel' : 'text'}
                    name={field.key}
                    value={formData[field.key as keyof FormData]}
                    onChange={handleInputChange}
                    placeholder={field.label}
                  />
                </div>
              ))}

              <div className="modal-buttons">
                <button onClick={() => setIsModalOpen(false)}>إلغاء</button>
                <button onClick={handleSubmit}>تسجيل</button>
              </div> */}
            {/* </div> */}
          </div>
      //   </div>
      // )}
    // </div>
  );
}
