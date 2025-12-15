"use client";
import React, { useState, useEffect } from 'react';
import '../styles/CreateFam.css';

// Generic function to decode JWT token
const decodeToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

interface CreateFamFormProps {
  onBack?: () => void;
  onSubmitSuccess?: () => void;
}

interface Person {
  fullName: string;
  nationalId?: string;
  mobile?: string;
  studentId?: string;
}

interface Committee {
  name: string;
  secretary: Person;
  assistant: Person;
  plan?: string;
  executionDate?: string;
  fundingSources?: string;
}

interface FormErrors {
  [key: string]: string;
}

const defaultPerson: Person = { fullName: '', nationalId: '', mobile: '', studentId: '' };

const CreateFamForm: React.FC<CreateFamFormProps> = ({ onBack, onSubmitSuccess }) => {
  const [familyName, setFamilyName] = useState('');
  const [familyGoals, setFamilyGoals] = useState('');
  const [familyDescription, setFamilyDescription] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const [studentId, setStudentId] = useState<number | null>(null);
  const [facultyId, setFacultyId] = useState<number | null>(null);
  const [deptMapping, setDeptMapping] = useState<{ [key: string]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [boardMembers, setBoardMembers] = useState({
    leader: { ...defaultPerson },
    viceLeader: { ...defaultPerson },
    responsible: { ...defaultPerson },
    treasurer: { ...defaultPerson },
    elderBrother: { ...defaultPerson },
    elderSister: { ...defaultPerson },
    secretary: { ...defaultPerson },
    elected1: { ...defaultPerson },
    elected2: { ...defaultPerson },
  });

  const [committees, setCommittees] = useState<{ [key: string]: Committee }>({
    cultural: { name: 'اللجنة الثقافية', secretary: { ...defaultPerson }, assistant: { ...defaultPerson }, plan: '', executionDate: '', fundingSources: '' },
    wall: { name: 'لجنة صحف الحائط', secretary: { ...defaultPerson }, assistant: { ...defaultPerson }, plan: '', executionDate: '', fundingSources: '' },
    social: { name: 'اللجنة الاجتماعية والرحلات', secretary: { ...defaultPerson }, assistant: { ...defaultPerson }, plan: '', executionDate: '', fundingSources: '' },
    technical: { name: 'اللجنة الفنية', secretary: { ...defaultPerson }, assistant: { ...defaultPerson }, plan: '', executionDate: '', fundingSources: '' },
    scientific: { name: 'اللجنة العلمية', secretary: { ...defaultPerson }, assistant: { ...defaultPerson }, plan: '', executionDate: '', fundingSources: '' },
    service: { name: 'لجنة الخدمة العامة والمعسكرات', secretary: { ...defaultPerson }, assistant: { ...defaultPerson }, plan: '', executionDate: '', fundingSources: '' },
    sports: { name: 'اللجنة الرياضية', secretary: { ...defaultPerson }, assistant: { ...defaultPerson }, plan: '', executionDate: '', fundingSources: '' },
  });

  // Fetch department mapping from database - Generic function
  const fetchDepartmentMapping = async (token: string) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/family/departments/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const mapping: { [key: string]: number } = {};

        console.log('=== Department API Response ===');
        console.log('Raw response:', data);

        // Map departments by name to ID - Generic approach
        if (Array.isArray(data)) {
          data.forEach((dept: any) => {
            if (dept.name) {
              mapping[dept.name] = dept.dept_id;
            }
          });
        } else if (data.results && Array.isArray(data.results)) {
          data.results.forEach((dept: any) => {
            if (dept.name) {
              mapping[dept.name] = dept.dept_id;
            }
          });
        }

        console.log('✓ Department Mapping created:', mapping);
        setDeptMapping(mapping);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem("access");
      if (!token) return;

      try {
        // Decode token to get faculty ID
        const decodedToken = decodeToken(token);
        console.log('=== Decoded Token ===');
        console.log('Token payload:', decodedToken);

        const response = await fetch("http://127.0.0.1:8000/api/auth/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('=== Profile Data ===');
          console.log('Full response:', data);
          console.log('Available keys:', Object.keys(data));
          
          setStudentId(data.student_id);
          
          // Use 'faculty' field from profile or fallback to token
          let faculId = null;
          if (data.faculty && data.faculty !== 0) {
            faculId = data.faculty;
            console.log('✓ Using faculty from profile:', faculId);
          } else if (decodedToken?.faculty_id) {
            faculId = decodedToken.faculty_id;
            console.log('✓ Using faculty_id from token:', faculId);
          }
          
          if (faculId) {
            setFacultyId(faculId);
          } else {
            console.warn('⚠️ No valid faculty ID found in profile or token');
          }

          // Fetch department mapping
          await fetchDepartmentMapping(token);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfileData();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const boardLabels = {
    leader: 'رائد الأسرة',
    viceLeader: 'نائب الرائد',
    responsible: 'مسئول الأسرة',
    treasurer: 'أمين الصندوق',
    elderBrother: 'الأخ الأكبر',
    elderSister: 'الأخت الكبرى',
    secretary: 'السكرتير / أمين السر',
    elected1: 'عضو منتخب (1)',
    elected2: 'عضو منتخب (2)',
  };

  const committeeKeys: { [key: string]: string } = {
    cultural: 'cultural',
    wall: 'wall',
    social: 'social',
    technical: 'technical',
    scientific: 'scientific',
    service: 'service',
    sports: 'sports',
  };

  const requiresFullInfo = ['leader', 'viceLeader', 'responsible', 'treasurer'];

  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields(prev => new Set([...prev, fieldName]));
  };

  const handleBoardChange = (key: keyof typeof boardMembers, field: string, value: string) => {
    setBoardMembers(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const handleCommitteeChange = (
    committeeKey: string,
    role: 'secretary' | 'assistant',
    field: keyof Person,
    value: string
  ) => {
    setCommittees(prev => ({
      ...prev,
      [committeeKey]: {
        ...prev[committeeKey],
        [role]: { ...prev[committeeKey][role], [field]: value },
      },
    }));
  };

  const handleCommitteeFieldChange = (committeeKey: string, field: string, value: string) => {
    setCommittees(prev => ({
      ...prev,
      [committeeKey]: {
        ...prev[committeeKey],
        [field]: value,
      },
    }));
  };

  const transformFormDataToAPI = () => {
    const defaultRoles: { [key: string]: any } = {
      رائد: {
        name: boardMembers.leader.fullName,
        nid: parseInt(boardMembers.leader.nationalId || '0'),
        ph_no: parseInt(boardMembers.leader.mobile || '0'),
      },
      نائب_رائد: {
        name: boardMembers.viceLeader.fullName,
        nid: parseInt(boardMembers.viceLeader.nationalId || '0'),
        ph_no: parseInt(boardMembers.viceLeader.mobile || '0'),
      },
      مسؤول: {
        name: boardMembers.responsible.fullName,
        nid: parseInt(boardMembers.responsible.nationalId || '0'),
        ph_no: parseInt(boardMembers.responsible.mobile || '0'),
      },
      أمين_صندوق: {
        name: boardMembers.treasurer.fullName,
        nid: parseInt(boardMembers.treasurer.nationalId || '0'),
        ph_no: parseInt(boardMembers.treasurer.mobile || '0'),
      },
      أخ_أكبر: {
        uid: parseInt(boardMembers.elderBrother.studentId || '0'),
      },
      أخت_كبرى: {
        uid: parseInt(boardMembers.elderSister.studentId || '0'),
      },
      أمين_سر: {
        uid: parseInt(boardMembers.secretary.studentId || '0'),
      },
      عضو_منتخب_1: {
        uid: parseInt(boardMembers.elected1.studentId || '0'),
      },
      عضو_منتخب_2: {
        uid: parseInt(boardMembers.elected2.studentId || '0'),
      },
    };

    const committeesData: any[] = [];

    Object.entries(committees).forEach(([key, committee]) => {
      const activities: any[] = [];
      
      if (committee.plan || committee.executionDate || committee.fundingSources) {
        activities.push({
          title: `نشاط ${committee.name}`,
          description: committee.plan || '',
          st_date: committee.executionDate ? formatDateForAPI(committee.executionDate) : new Date().toISOString().split('T')[0],
          end_date: committee.executionDate ? formatDateForAPI(committee.executionDate) : new Date().toISOString().split('T')[0],
          location: '',
          cost: committee.fundingSources || '0',
        });
      }

      // Generic dept_id mapping: Use deptMapping if available, otherwise use faculty ID
      let deptId = facultyId || 0;
      
      // Committee to department name mapping - handle various database structures
      const committeeDeptMapping: { [key: string]: string[] } = {
        sports: ['الأنشطة الرياضية', 'activities sports', 'sports activities'],
        cultural: ['الأنشطة الثقافية', 'activities cultural', 'cultural activities'],
        social: ['الأنشطة الاجتماعية', 'activities social', 'social activities'],
        scientific: ['الأنشطة العلمية', 'activities scientific', 'scientific activities'],
        wall: ['الأنشطة الثقافية', 'activities cultural'], // wall is under cultural
        technical: ['الأنشطة الثقافية', 'activities cultural'], // technical is under cultural
        service: ['الأنشطة الاجتماعية', 'activities social'], // service is under social
      };

      if (deptMapping && Object.keys(deptMapping).length > 0) {
        const possibleDepts = committeeDeptMapping[key] || [];
        
        // Try to find matching department
        const matchedDept = Object.entries(deptMapping).find(([deptName]) =>
          possibleDepts.some(pd => 
            deptName.includes(pd) || pd.includes(deptName) || 
            deptName.toLowerCase().includes(pd.toLowerCase())
          )
        );

        if (matchedDept) {
          deptId = matchedDept[1];
          console.log(`✓ Mapped committee "${key}" to dept "${matchedDept[0]}" (ID: ${deptId})`);
        } else {
          console.warn(`⚠️ No dept found for committee "${key}". Available depts:`, Object.keys(deptMapping));
        }
      }

      const committeeData = {
        committee_key: committeeKeys[key] || key,
        head: {
          uid: parseInt(committee.secretary.studentId || '0'),
          dept_id: deptId,
        },
        assistant: {
          uid: parseInt(committee.assistant.studentId || '0'),
          dept_id: deptId,
        },
        activities,
      };
      console.log(`📋 Committee "${key}" payload:`, committeeData);
      committeesData.push(committeeData);
    });

    return {
      family_type: 'نوعية',
      name: familyName,
      description: familyDescription,
      min_limit: 15,
      faculty_id: facultyId || 0,
      default_roles: defaultRoles,
      committees: committeesData,
    };
  };

  const formatDateForAPI = (dateStr: string): string => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    try {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const allFields = new Set<string>();
    allFields.add('familyName');
    allFields.add('familyGoals');
    allFields.add('familyDescription');

    Object.keys(boardMembers).forEach(key => {
      if (requiresFullInfo.includes(key)) {
        allFields.add(`board_${key}_name`);
        allFields.add(`board_${key}_nationalId`);
        allFields.add(`board_${key}_mobile`);
      } else {
        allFields.add(`board_${key}_studentId`);
      }
    });

    Object.keys(committees).forEach(key => {
      allFields.add(`committee_${key}_secretary_studentId`);
      allFields.add(`committee_${key}_assistant_studentId`);
    });

    setTouchedFields(allFields);

    // const isValid = validateForm();

    // if (!isValid) {
    //   window.scrollTo({ top: 0, behavior: 'smooth' });
    //   return;
    // }

    // if (!studentId) {
    //   showNotification('error', 'لم يتم العثور على معرف الطالب');
    //   return;
    // }

    // if (!facultyId || facultyId === 0) {
    //   console.warn('=== Faculty ID Validation Failed ===');
    //   console.warn('Faculty ID:', facultyId);
    //   console.warn('Student ID:', studentId);
    //   console.log('Check browser console for profile data logs');
    //   showNotification('error', `❌ لم يتم العثور على الكلية (${facultyId}). يرجى فحص وحدة التحكم (F12) وإعادة تحميل الصفحة`);
    //   window.scrollTo({ top: 0, behavior: 'smooth' });
    //   return;
    // }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("access");
      if (!token) {
        showNotification('error', 'يرجى تسجيل الدخول أولاً');
        setIsSubmitting(false);
        return;
      }

      const apiPayload = transformFormDataToAPI();
      console.log('=== API Request ===');
      console.log('Full payload:', apiPayload);
      console.log('Faculty ID being sent:', apiPayload.faculty_id);
      console.log('Faculty ID state:', facultyId);
      console.log('Department mapping used:', deptMapping);
      console.log('Committees dept_ids:', apiPayload.committees.map((c: any) => ({
        committee: c.committee_key,
        head_dept: c.head.dept_id,
        assistant_dept: c.assistant.dept_id,
      })));

      const response = await fetch(
        `http://127.0.0.1:8000/api/family/student/create/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiPayload),
        }
      );

      if (response.ok) {
        const data = await response.json();
        showNotification('success', '✅ تم إنشاء الأسرة بنجاح');
        
        setErrors({});
        setTouchedFields(new Set());

        setTimeout(() => {
          if (onSubmitSuccess) {
            onSubmitSuccess();
          }
        }, 1500);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("=== API Error Response ===");
        console.error("Full error:", errorData);
        
        let errorMessage = 'فشل إنشاء الأسرة';
        
        if (errorData?.errors) {
          const errors = errorData.errors;
          console.error("Detailed errors:", errors);
          
          if (errors.faculty_id) {
            errorMessage = errors.faculty_id[0] || 'خطأ في الكلية';
          } else if (errors.default_roles) {
            errorMessage = `خطأ في بيانات مجلس الإدارة: ${JSON.stringify(errors.default_roles)}`;
          } else if (errors.committees) {
            console.error("=== Committee Errors Details ===");
            if (Array.isArray(errors.committees)) {
              errors.committees.forEach((error: any, index: number) => {
                console.error(`Committee ${index}:`, error);
              });
            }
            errorMessage = `خطأ في بيانات اللجان: ${JSON.stringify(errors.committees)}`;
          } else {
            // Show first error found
            const firstError = Object.entries(errors)[0];
            if (firstError) {
              errorMessage = `${firstError[0]}: ${JSON.stringify(firstError[1])}`;
            }
          }
        } else if (errorData?.detail) {
          errorMessage = errorData.detail;
        }
        
        showNotification('error', `❌ ${errorMessage}`);
      }
    } catch (error) {
      console.error("Network error:", error);
      showNotification('error', '⚠️ فشل الاتصال بالسيرفر');
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="create-fam-container">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <form className="create-fam-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <h1>نموذج طلب إنشاء أسرة طلابية</h1>
          <p>يرجى تعبئة جميع البيانات المطلوبة بدقة</p>
        </div>

        {/* Family Main Info */}
        <section className="form-section">
          <h2 className="section-title">بيانات الأسرة الرئيسية</h2>

          <div className="form-group">
            <label>اسم الأسرة *</label>
            <input
              className="form-input"
              value={familyName}
              onChange={e => setFamilyName(e.target.value)}
              onBlur={() => handleFieldBlur('familyName')}
              placeholder="أدخل اسم الأسرة"
            />
          </div>

          <div className="form-group">
            <label>أهداف الأسرة *</label>
            <textarea
              className="form-textarea"
              value={familyGoals}
              onChange={e => setFamilyGoals(e.target.value)}
              onBlur={() => handleFieldBlur('familyGoals')}
              rows={4}
              placeholder="اذكر أهداف الأسرة بشكل واضح ومفصل"
            />
          </div>

          <div className="form-group">
            <label>وصف الأسرة *</label>
            <textarea
              className="form-textarea"
              value={familyDescription}
              onChange={e => setFamilyDescription(e.target.value)}
              onBlur={() => handleFieldBlur('familyDescription')}
              rows={5}
              placeholder="قدم وصفاً تفصيلياً للأسرة ونشاطاتها"
            />
          </div>
        </section>

        {/* Board Members */}
        <section className="form-section">
          <h2 className="section-title">مجلس إدارة الأسرة</h2>
          {Object.entries(boardMembers).map(([key, person]) => {
            const isFullInfo = requiresFullInfo.includes(key);
            return (
              <div key={key} className="board-member-card">
                <h3 className="board-member-title">{boardLabels[key as keyof typeof boardLabels]}</h3>

                <div className="member-fields">
                  {isFullInfo && (
                    <div className="field-wrapper">
                      <label>الاسم *</label>
                      <input
                        placeholder="الاسم الكامل"
                        value={person.fullName}
                        onChange={e => handleBoardChange(key as keyof typeof boardMembers, 'fullName', e.target.value)}
                        onBlur={() => handleFieldBlur(`board_${key}_name`)}
                      />
                    </div>
                  )}

                  {isFullInfo ? (
                    <>
                      <div className="field-wrapper">
                        <label>الرقم القومي *</label>
                        <input
                          placeholder="14 رقم"
                          maxLength={14}
                          value={person.nationalId || ''}
                          onChange={e => handleBoardChange(key as keyof typeof boardMembers, 'nationalId', e.target.value.replace(/\D/g, ''))}
                          onBlur={() => handleFieldBlur(`board_${key}_nationalId`)}
                        />
                      </div>
                      <div className="field-wrapper">
                        <label>رقم الموبايل *</label>
                        <input
                          placeholder="01XXXXXXXXX"
                          maxLength={11}
                          value={person.mobile || ''}
                          onChange={e => handleBoardChange(key as keyof typeof boardMembers, 'mobile', e.target.value.replace(/\D/g, ''))}
                          onBlur={() => handleFieldBlur(`board_${key}_mobile`)}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="field-wrapper">
                      <label>كود الطالب *</label>
                      <input
                        placeholder="أدخل كود الطالب"
                        value={person.studentId || ''}
                        onChange={e => handleBoardChange(key as keyof typeof boardMembers, 'studentId', e.target.value)}
                        onBlur={() => handleFieldBlur(`board_${key}_studentId`)}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {Object.entries(committees).map(([key, committee]) => (
  <div key={key} className="committee-card">
    <div className="committee-name-header">{committee.name}</div>

    <div className="committee-role-section">
      <h4 className="committee-role-title">أمين اللجنة</h4>
      <div className="member-fields">
        <div className="field-wrapper">
          <label>كود الطالب *</label>
          <input
            placeholder="أدخل كود الطالب"
            value={committee.secretary.studentId || ''}
            onChange={e => handleCommitteeChange(key, 'secretary', 'studentId', e.target.value)}
            onBlur={() => handleFieldBlur(`committee_${key}_secretary_studentId`)}
          />
        </div>
      </div>
    </div>

    <div className="committee-role-section">
      <h4 className="committee-role-title">أمين مساعد اللجنة</h4>
      <div className="member-fields">
        <div className="field-wrapper">
          <label>كود الطالب *</label>
          <input
            placeholder="أدخل كود الطالب"
            value={committee.assistant.studentId || ''}
            onChange={e => handleCommitteeChange(key, 'assistant', 'studentId', e.target.value)}
            onBlur={() => handleFieldBlur(`committee_${key}_assistant_studentId`)}
          />
        </div>
      </div>
    </div>
              <div className="committee-optional-fields">
                <div className="form-group">
                  <label>الخطة <span className="optional-label">(اختياري)</span></label>
                  <textarea
                    className="form-textarea"
                    placeholder="أدخل خطة اللجنة"
                    rows={3}
                    value={committee.plan || ''}
                    onChange={e => handleCommitteeFieldChange(key, 'plan', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>موعد التنفيذ <span className="optional-label">(اختياري)</span></label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="أدخل موعد التنفيذ"
                    value={committee.executionDate || ''}
                    onChange={e => handleCommitteeFieldChange(key, 'executionDate', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>مصادر التمويل <span className="optional-label">(اختياري)</span></label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="أدخل مصادر التمويل"
                    value={committee.fundingSources || ''}
                    onChange={e => handleCommitteeFieldChange(key, 'fundingSources', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
    

        {/* Footer Buttons */}
        <div className="form-footer">
          <button
            type="button"
            className="btn-back"
            disabled={isSubmitting}
            onClick={() => {
              if (onBack) {
                onBack();
              } else {
                window.history.back();
              }
            }}
          >
            العودة
          </button>
          <button 
            type="submit" 
            className="btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'جاري التقديم...' : 'تقديم الطلب'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateFamForm;