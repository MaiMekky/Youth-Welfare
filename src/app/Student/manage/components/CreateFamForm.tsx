"use client";
import React, { useState, useEffect } from 'react';
import '../styles/CreateFam.css';

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

interface Department {
  dept_id: number;
  name: string;
}

interface FormErrors {
  [key: string]: string;
}

const defaultPerson: Person = { fullName: '', nationalId: '', mobile: '', studentId: '' };

const CreateFamForm: React.FC<CreateFamFormProps> = ({ onBack, onSubmitSuccess }) => {
  const [familyType, setFamilyType] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [familyGoals, setFamilyGoals] = useState('');
  const [familyDescription, setFamilyDescription] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const [studentId, setStudentId] = useState<number | null>(null);
  const [facultyId, setFacultyId] = useState<number | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
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

  const [committees, setCommittees] = useState<{ [key: string]: Committee & { selectedDeptId?: string } }>({
    cultural: { name: 'اللجنة الثقافية', secretary: { ...defaultPerson }, assistant: { ...defaultPerson }, plan: '', executionDate: '', fundingSources: '', selectedDeptId: '' },
    wall: { name: 'لجنة صحف الحائط', secretary: { ...defaultPerson }, assistant: { ...defaultPerson }, plan: '', executionDate: '', fundingSources: '', selectedDeptId: '' },
    social: { name: 'اللجنة الاجتماعية والرحلات', secretary: { ...defaultPerson }, assistant: { ...defaultPerson }, plan: '', executionDate: '', fundingSources: '', selectedDeptId: '' },
    technical: { name: 'اللجنة الفنية', secretary: { ...defaultPerson }, assistant: { ...defaultPerson }, plan: '', executionDate: '', fundingSources: '', selectedDeptId: '' },
    scientific: { name: 'اللجنة العلمية', secretary: { ...defaultPerson }, assistant: { ...defaultPerson }, plan: '', executionDate: '', fundingSources: '', selectedDeptId: '' },
    service: { name: 'لجنة الخدمة العامة والمعسكرات', secretary: { ...defaultPerson }, assistant: { ...defaultPerson }, plan: '', executionDate: '', fundingSources: '', selectedDeptId: '' },
    sports: { name: 'اللجنة الرياضية', secretary: { ...defaultPerson }, assistant: { ...defaultPerson }, plan: '', executionDate: '', fundingSources: '', selectedDeptId: '' },
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;

  useEffect(() => {
    if (!token) return;

    const fetchDepartments = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/family/departments/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const response = await res.json();

        let depts: Department[] = [];
        
        if (Array.isArray(response)) {
          depts = response;
        } else if (response.departments && Array.isArray(response.departments)) {
          depts = response.departments;
        } else if (response.results && Array.isArray(response.results)) {
          depts = response.results;
        }

        setDepartments(depts);
      } catch (error) {
        // Silent error handling
      }
    };

    fetchDepartments();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const fetchProfileData = async () => {
      try {
        const decodedToken = decodeToken(token);

        const response = await fetch("http://127.0.0.1:8000/api/auth/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          
          setStudentId(data.student_id);
          
          let faculId = null;
          if (data.faculty && data.faculty !== 0) {
            faculId = data.faculty;
          } else if (decodedToken?.faculty_id) {
            faculId = decodedToken.faculty_id;
          }
          
          if (faculId) {
            setFacultyId(faculId);
          }
        }
      } catch (error) {
        // Silent error handling
      }
    };

    fetchProfileData();
  }, [token]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
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
    wall: 'newspaper',
    social: 'social',
    technical: 'arts',
    scientific: 'scientific',
    service: 'service',
    sports: 'sports',
  };

  const requiresFullInfo = ['leader', 'viceLeader', 'responsible', 'treasurer'];

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!familyType) {
      newErrors.familyType = 'يرجى اختيار نوع الأسرة';
    }

    if (!familyName.trim()) {
      newErrors.familyName = 'يرجى إدخال اسم الأسرة';
    }

    if (!familyDescription.trim()) {
      newErrors.familyDescription = 'يرجى إدخال وصف الأسرة';
    }

    requiresFullInfo.forEach(key => {
      const member = boardMembers[key as keyof typeof boardMembers];
      if (!member.fullName.trim()) {
        newErrors[`board_${key}_fullName`] = 'الاسم مطلوب';
      }
      if (!member.nationalId || member.nationalId.length !== 14) {
        newErrors[`board_${key}_nationalId`] = 'الرقم القومي يجب أن يكون 14 رقم';
      }
      if (!member.mobile || member.mobile.length !== 11) {
        newErrors[`board_${key}_mobile`] = 'رقم الموبايل يجب أن يكون 11 رقم';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields(prev => new Set([...prev, fieldName]));
  };

  const handleBoardChange = (key: keyof typeof boardMembers, field: string, value: string) => {
    setBoardMembers(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
    if (errors[`board_${key}_${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`board_${key}_${field}`];
        return newErrors;
      });
    }
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

  const handleCommitteeDeptChange = (committeeKey: string, deptId: string) => {
    setCommittees(prev => ({
      ...prev,
      [committeeKey]: {
        ...prev[committeeKey],
        selectedDeptId: deptId,
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

      const deptId = committee.selectedDeptId ? parseInt(committee.selectedDeptId) : (facultyId || 0);

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
      
      committeesData.push(committeeData);
    });

    return {
      family_type: familyType,
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

    if (!validateForm()) {
      showNotification('error', 'الرجاء ملء جميع البيانات المطلوبة بشكل صحيح');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      if (!token) {
        showNotification('error', 'يرجى تسجيل الدخول أولاً');
        setIsSubmitting(false);
        return;
      }

      const apiPayload = transformFormDataToAPI();

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
        showNotification('success', 'تم ارسال طلبك بنجاح ويرجى مراجعته إلى أن يتم قبوله');
        
        setErrors({});
        setTouchedFields(new Set());

        setTimeout(() => {
          if (onSubmitSuccess) {
            onSubmitSuccess();
          }
        }, 2000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        
        let errorMessage = 'فشل ارسال الطلب. يرجى المحاولة مرة أخرى';
        
        if (errorData?.errors) {
          const errors = errorData.errors;
          
          if (errors.faculty_id) {
            errorMessage = `خطأ في بيانات الكلية: ${errors.faculty_id[0]}`;
          } else if (errors.default_roles) {
            errorMessage = `خطأ في بيانات مجلس الإدارة. يرجى التحقق من جميع البيانات المطلوبة`;
          } else if (errors.committees) {
            errorMessage = `خطأ في بيانات اللجان. يرجى التحقق من جميع البيانات المطلوبة`;
          } else if (errors.name) {
            errorMessage = `خطأ في اسم الأسرة: ${errors.name[0]}`;
          } else {
            const firstError = Object.entries(errors)[0];
            if (firstError) {
              errorMessage = `خطأ في ${firstError[0]}: ${Array.isArray(firstError[1]) ? firstError[1][0] : firstError[1]}`;
            }
          }
        } else if (errorData?.detail) {
          errorMessage = errorData.detail;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        }
        
        showNotification('error', errorMessage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      showNotification('error', 'فشل الاتصال بالخادم. يرجى التحقق من الاتصال بالإنترنت والمحاولة مرة أخرى');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-fam-container">
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <span className="notification-icon">
              {notification.type === 'success' ? '✓' : '✕'}
            </span>
            <span className="notification-message">{notification.message}</span>
          </div>
        </div>
      )}
      
      <form className="create-fam-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <h1>نموذج طلب إنشاء أسرة طلابية</h1>
          <p>يرجى تعبئة جميع البيانات المطلوبة بدقة</p>
        </div>

        {/* Family Type Selection */}
        <section className="form-section family-type-section">
          <div className="form-group">
            <label>نوع الأسرة *</label>
            <select
              className={`form-select ${errors.familyType && touchedFields.has('familyType') ? 'error' : ''}`}
              value={familyType}
              onChange={e => {
                setFamilyType(e.target.value);
                if (errors.familyType) {
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.familyType;
                    return newErrors;
                  });
                }
              }}
              onBlur={() => handleFieldBlur('familyType')}
            >
              <option value="">اختر نوع الأسرة</option>
              <option value="نوعية">نوعية</option>
              <option value="مركزية">مركزية</option>
            </select>
            {errors.familyType && touchedFields.has('familyType') && (
              <div className="error-message">
                <span>⚠</span>
                <span>{errors.familyType}</span>
              </div>
            )}
          </div>
        </section>

        {/* Family Main Info */}
        <section className="form-section">
          <h2 className="section-title">بيانات الأسرة الرئيسية</h2>

          <div className="form-group">
            <label>اسم الأسرة *</label>
            <input
              className={`form-input ${errors.familyName && touchedFields.has('familyName') ? 'error' : ''}`}
              value={familyName}
              onChange={e => {
                setFamilyName(e.target.value);
                if (errors.familyName) {
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.familyName;
                    return newErrors;
                  });
                }
              }}
              onBlur={() => handleFieldBlur('familyName')}
              placeholder="أدخل اسم الأسرة"
            />
            {errors.familyName && touchedFields.has('familyName') && (
              <div className="error-message">
                <span>⚠</span>
                <span>{errors.familyName}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>أهداف الأسرة </label>
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
              className={`form-textarea ${errors.familyDescription && touchedFields.has('familyDescription') ? 'error' : ''}`}
              value={familyDescription}
              onChange={e => {
                setFamilyDescription(e.target.value);
                if (errors.familyDescription) {
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.familyDescription;
                    return newErrors;
                  });
                }
              }}
              onBlur={() => handleFieldBlur('familyDescription')}
              rows={5}
              placeholder="قدم وصفاً تفصيلياً للأسرة ونشاطاتها"
            />
            {errors.familyDescription && touchedFields.has('familyDescription') && (
              <div className="error-message">
                <span>⚠</span>
                <span>{errors.familyDescription}</span>
              </div>
            )}
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
                        className={errors[`board_${key}_fullName`] && touchedFields.has(`board_${key}_fullName`) ? 'error' : ''}
                        value={person.fullName}
                        onChange={e => handleBoardChange(key as keyof typeof boardMembers, 'fullName', e.target.value)}
                        onBlur={() => handleFieldBlur(`board_${key}_fullName`)}
                      />
                      {errors[`board_${key}_fullName`] && touchedFields.has(`board_${key}_fullName`) && (
                        <div className="field-error">{errors[`board_${key}_fullName`]}</div>
                      )}
                    </div>
                  )}

                  {isFullInfo ? (
                    <>
                      <div className="field-wrapper">
                        <label>الرقم القومي *</label>
                        <input
                          placeholder="14 رقم"
                          maxLength={14}
                          className={errors[`board_${key}_nationalId`] && touchedFields.has(`board_${key}_nationalId`) ? 'error' : ''}
                          value={person.nationalId || ''}
                          onChange={e => handleBoardChange(key as keyof typeof boardMembers, 'nationalId', e.target.value.replace(/\D/g, ''))}
                          onBlur={() => handleFieldBlur(`board_${key}_nationalId`)}
                        />
                        {errors[`board_${key}_nationalId`] && touchedFields.has(`board_${key}_nationalId`) && (
                          <div className="field-error">{errors[`board_${key}_nationalId`]}</div>
                        )}
                      </div>
                      <div className="field-wrapper">
                        <label>رقم الموبايل *</label>
                        <input
                          placeholder="01XXXXXXXXX"
                          maxLength={11}
                          className={errors[`board_${key}_mobile`] && touchedFields.has(`board_${key}_mobile`) ? 'error' : ''}
                          value={person.mobile || ''}
                          onChange={e => handleBoardChange(key as keyof typeof boardMembers, 'mobile', e.target.value.replace(/\D/g, ''))}
                          onBlur={() => handleFieldBlur(`board_${key}_mobile`)}
                        />
                        {errors[`board_${key}_mobile`] && touchedFields.has(`board_${key}_mobile`) && (
                          <div className="field-error">{errors[`board_${key}_mobile`]}</div>
                        )}
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

        {/* Committees */}
        <section className="form-section">
          <h2 className="section-title">اللجان</h2>
          {Object.entries(committees).map(([key, committee]) => (
            <div key={key} className="committee-card">
              <div className="committee-name-header">{committee.name}</div>

              {/* Department Selection */}
              <div className="form-group">
                <label>القسم المسؤول *</label>
                <select
                  className="form-select"
                  value={committee.selectedDeptId || ''}
                  onChange={e => handleCommitteeDeptChange(key, e.target.value)}
                >
                  <option value="">اختر القسم</option>
                  {departments.map(dept => (
                    <option key={dept.dept_id} value={dept.dept_id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

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
                    type="date"
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
        </section>

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