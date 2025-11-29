"use client";
import React, { useState } from 'react';

interface CreateFamFormProps {
  onBack?: () => void;
  onSubmitSuccess?: () => void;
}

const COLORS = {
  darkNavy: '#171842ff',
  gold: '#B38E19',
  lightBg: '#F3F5FD',
  white: '#FFFFFF',
  error: '#d32f2f',
  errorLight: '#ffebee',
  success: '#388e3c',
};

interface Person {
  fullName: string;
  nationalId: string;
  mobile: string;
}

interface Committee {
  name: string;
  secretary: Person;
  assistant: Person;
}

interface FormErrors {
  [key: string]: string;
}

const defaultPerson: Person = { fullName: '', nationalId: '', mobile: '' };

const CreateFamForm: React.FC<CreateFamFormProps> = ({ onBack, onSubmitSuccess }) => {
  const [familyName, setFamilyName] = useState('');
  const [familyGoals, setFamilyGoals] = useState('');
  const [familyDescription, setFamilyDescription] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

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

  const [committees, setCommittees] = useState({
    cultural: { name: 'اللجنة الثقافية', secretary: { ...defaultPerson }, assistant: { ...defaultPerson } },
    wall: { name: 'لجنة صحف الحائط', secretary: { ...defaultPerson }, assistant: { ...defaultPerson } },
    social: { name: 'اللجنة الاجتماعية والرحلات', secretary: { ...defaultPerson }, assistant: { ...defaultPerson } },
    technical: { name: 'اللجنة الفنية', secretary: { ...defaultPerson }, assistant: { ...defaultPerson } },
    scientific: { name: 'اللجنة العلمية', secretary: { ...defaultPerson }, assistant: { ...defaultPerson } },
    service: { name: 'لجنة الخدمة العامة والمعسكرات', secretary: { ...defaultPerson }, assistant: { ...defaultPerson } },
    sports: { name: 'اللجنة الرياضية', secretary: { ...defaultPerson }, assistant: { ...defaultPerson } },
  });

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

  const validateNationalId = (id: string) => /^\d{14}$/.test(id);
  const validatePhoneNumber = (phone: string) => /^01\d{9}$/.test(phone);
  const validateTextField = (text: string, minLength = 3) => text.trim().length >= minLength;

  const addError = (fieldName: string, message: string) => {
    setErrors(prev => ({ ...prev, [fieldName]: message }));
  };

  const clearError = (fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields(prev => new Set([...prev, fieldName]));
    validateField(fieldName);
  };

  const validateField = (fieldName: string) => {
    if (fieldName === 'familyName') {
      if (!validateTextField(familyName, 3)) {
        addError('familyName', 'اسم الأسرة يجب أن يكون 3 أحرف على الأقل');
      } else {
        clearError('familyName');
      }
    } else if (fieldName === 'familyGoals') {
      if (!validateTextField(familyGoals, 10)) {
        addError('familyGoals', 'أهداف الأسرة يجب أن تكون 10 أحرف على الأقل');
      } else {
        clearError('familyGoals');
      }
    } else if (fieldName === 'familyDescription') {
      if (!validateTextField(familyDescription, 10)) {
        addError('familyDescription', 'وصف الأسرة يجب أن يكون 10 أحرف على الأقل');
      } else {
        clearError('familyDescription');
      }
    }
  };

  const validatePerson = (person: Person, prefix: string): boolean => {
    let isValid = true;

    if (!validateTextField(person.fullName, 3)) {
      addError(`${prefix}_name`, 'الاسم يجب أن يكون 3 أحرف على الأقل');
      isValid = false;
    } else {
      clearError(`${prefix}_name`);
    }

    if (!validateNationalId(person.nationalId)) {
      addError(`${prefix}_nationalId`, 'الرقم القومي يجب أن يكون 14 رقم');
      isValid = false;
    } else {
      clearError(`${prefix}_nationalId`);
    }

    if (!validatePhoneNumber(person.mobile)) {
      addError(`${prefix}_mobile`, 'رقم الموبايل يجب أن يكون 01XXXXXXXXX');
      isValid = false;
    } else {
      clearError(`${prefix}_mobile`);
    }

    return isValid;
  };

  const validateForm = (): boolean => {
    let isValid = true;

    if (!validateTextField(familyName, 3)) {
      addError('familyName', 'اسم الأسرة يجب أن يكون 3 أحرف على الأقل');
      isValid = false;
    }

    if (!validateTextField(familyGoals, 10)) {
      addError('familyGoals', 'أهداف الأسرة يجب أن تكون 10 أحرف على الأقل');
      isValid = false;
    }

    if (!validateTextField(familyDescription, 10)) {
      addError('familyDescription', 'وصف الأسرة يجب أن يكون 10 أحرف على الأقل');
      isValid = false;
    }

    Object.entries(boardMembers).forEach(([key, person]) => {
      if (!validatePerson(person, `board_${key}`)) {
        isValid = false;
      }
    });

    Object.entries(committees).forEach(([key, committee]) => {
      if (!validatePerson(committee.secretary, `committee_${key}_secretary`)) {
        isValid = false;
      }
      if (!validatePerson(committee.assistant, `committee_${key}_assistant`)) {
        isValid = false;
      }
    });

    return isValid;
  };

  const handleBoardChange = (key: keyof typeof boardMembers, field: string, value: string) => {
    setBoardMembers(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const handleCommitteeChange = (committeeKey: keyof typeof committees, role: 'secretary' | 'assistant', field: keyof Person, value: string) => {
    setCommittees(prev => ({
      ...prev,
      [committeeKey]: {
        ...prev[committeeKey],
        [role]: { ...prev[committeeKey][role], [field]: value },
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Save form data (you can replace this with API call later)
      const formData = {
        familyName,
        familyGoals,
        familyDescription,
        boardMembers,
        committees,
        submittedAt: new Date().toISOString()
      };
      
      console.log("Form submitted:", formData);
      
      // Save to localStorage for tracking
      localStorage.setItem("familyRequestData", JSON.stringify(formData));
      localStorage.setItem("familyRequestStatus", "pending");
      localStorage.setItem("familyRequestSubmitted", "true");
      
      setErrors({});
      setTouchedFields(new Set());
      
      // Call success callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    }
  };

  const getFieldError = (fieldName: string) => errors[fieldName] || '';
  const isFieldTouched = (fieldName: string) => touchedFields.has(fieldName);
  const hasFieldError = (fieldName: string) => isFieldTouched(fieldName) && !!errors[fieldName];

  const inputStyle = (hasError: boolean) => ({
    width: '100%',
    padding: '12px 15px',
    border: `2px solid ${hasError ? COLORS.error : '#E0E0E0'}`,
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: hasError ? COLORS.errorLight : COLORS.white,
    boxSizing: 'border-box' as const,
    textAlign: 'right' as const,
    transition: 'all 0.3s ease',
  });

  const textareaStyle = (hasError: boolean) => ({
    ...inputStyle(hasError),
    fontFamily: 'inherit',
    resize: 'vertical' as const,
  });

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: COLORS.lightBg, minHeight: '100vh', padding: '20px', direction: 'rtl' }}>
      <form style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: COLORS.white, borderRadius: '12px', boxShadow: '0 6px 15px rgba(0, 0, 0, 0.1)', padding: '30px 40px' }} onSubmit={handleSubmit}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: `3px solid ${COLORS.gold}` }}>
          <h1 style={{ color: COLORS.darkNavy, marginBottom: '8px', fontSize: '28px', fontWeight: '700' }}>نموذج طلب إنشاء أسرة طلابية</h1>
          <p style={{ color: COLORS.darkNavy, fontSize: '16px', margin: '0' }}>يرجى تعبئة جميع البيانات المطلوبة بدقة</p>
        </div>

        {/* Family Main Info */}
        <section style={{ backgroundColor: COLORS.lightBg, padding: '25px', borderRadius: '12px', marginBottom: '25px', border: `2px solid ${COLORS.gold}`, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ color: COLORS.darkNavy, fontSize: '22px', marginBottom: '20px', paddingBottom: '10px', borderBottom: `2px solid ${COLORS.gold}`, textAlign: 'center', fontWeight: '700' }}>بيانات الأسرة الرئيسية</h2>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: COLORS.darkNavy, fontSize: '14px' }}>اسم الأسرة *</label>
            <input
              value={familyName}
              onChange={e => setFamilyName(e.target.value)}
              onBlur={() => handleFieldBlur('familyName')}
              style={inputStyle(hasFieldError('familyName'))}
              placeholder="أدخل اسم الأسرة"
            />
            {hasFieldError('familyName') && (
              <div style={{ color: COLORS.error, fontSize: '13px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>⚠️</span>
                <span>{getFieldError('familyName')}</span>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: COLORS.darkNavy, fontSize: '14px' }}>أهداف الأسرة *</label>
            <textarea
              value={familyGoals}
              onChange={e => setFamilyGoals(e.target.value)}
              onBlur={() => handleFieldBlur('familyGoals')}
              rows={4}
              style={textareaStyle(hasFieldError('familyGoals'))}
              placeholder="اذكر أهداف الأسرة بشكل واضح ومفصل"
            />
            {hasFieldError('familyGoals') && (
              <div style={{ color: COLORS.error, fontSize: '13px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>⚠️</span>
                <span>{getFieldError('familyGoals')}</span>
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: COLORS.darkNavy, fontSize: '14px' }}>وصف الأسرة *</label>
            <textarea
              value={familyDescription}
              onChange={e => setFamilyDescription(e.target.value)}
              onBlur={() => handleFieldBlur('familyDescription')}
              rows={5}
              style={textareaStyle(hasFieldError('familyDescription'))}
              placeholder="قدم وصفاً تفصيلياً للأسرة ونشاطاتها"
            />
            {hasFieldError('familyDescription') && (
              <div style={{ color: COLORS.error, fontSize: '13px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>⚠️</span>
                <span>{getFieldError('familyDescription')}</span>
              </div>
            )}
          </div>
        </section>

        {/* Board Members */}
        <section style={{ backgroundColor: COLORS.lightBg, padding: '25px', borderRadius: '12px', marginBottom: '25px', border: `2px solid ${COLORS.gold}`, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ color: COLORS.darkNavy, fontSize: '22px', marginBottom: '20px', paddingBottom: '10px', borderBottom: `2px solid ${COLORS.gold}`, textAlign: 'center', fontWeight: '700' }}>مجلس إدارة الأسرة</h2>
          {Object.entries(boardMembers).map(([key, person]) => (
            <div key={key} style={{ backgroundColor: COLORS.white, padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #E0E0E0', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '15px', color: COLORS.darkNavy, fontWeight: '600', paddingBottom: '8px', borderBottom: `1px solid ${COLORS.gold}` }}>{boardLabels[key as keyof typeof boardLabels]}</h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: COLORS.darkNavy, marginBottom: '5px', display: 'block' }}>الاسم *</label>
                  <input
                    placeholder="الاسم الكامل"
                    value={person.fullName}
                    onChange={e => handleBoardChange(key as keyof typeof boardMembers, 'fullName', e.target.value)}
                    onBlur={() => handleFieldBlur(`board_${key}_name`)}
                    style={inputStyle(hasFieldError(`board_${key}_name`))}
                  />
                  {hasFieldError(`board_${key}_name`) && (
                    <div style={{ color: COLORS.error, fontSize: '11px', marginTop: '4px' }}>⚠️ {getFieldError(`board_${key}_name`)}</div>
                  )}
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: COLORS.darkNavy, marginBottom: '5px', display: 'block' }}>الرقم القومي *</label>
                  <input
                    placeholder="14 رقم"
                    maxLength={14}
                    value={person.nationalId}
                    onChange={e => handleBoardChange(key as keyof typeof boardMembers, 'nationalId', e.target.value.replace(/\D/g, ''))}
                    onBlur={() => handleFieldBlur(`board_${key}_nationalId`)}
                    style={inputStyle(hasFieldError(`board_${key}_nationalId`))}
                  />
                  {hasFieldError(`board_${key}_nationalId`) && (
                    <div style={{ color: COLORS.error, fontSize: '11px', marginTop: '4px' }}>⚠️ {getFieldError(`board_${key}_nationalId`)}</div>
                  )}
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: COLORS.darkNavy, marginBottom: '5px', display: 'block' }}>رقم الموبايل *</label>
                  <input
                    placeholder="01XXXXXXXXX"
                    maxLength={11}
                    value={person.mobile}
                    onChange={e => handleBoardChange(key as keyof typeof boardMembers, 'mobile', e.target.value.replace(/\D/g, ''))}
                    onBlur={() => handleFieldBlur(`board_${key}_mobile`)}
                    style={inputStyle(hasFieldError(`board_${key}_mobile`))}
                  />
                  {hasFieldError(`board_${key}_mobile`) && (
                    <div style={{ color: COLORS.error, fontSize: '11px', marginTop: '4px' }}>⚠️ {getFieldError(`board_${key}_mobile`)}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Committees */}
        <section style={{ backgroundColor: COLORS.lightBg, padding: '25px', borderRadius: '12px', marginBottom: '25px', border: `2px solid ${COLORS.gold}`, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ color: COLORS.darkNavy, fontSize: '22px', marginBottom: '20px', paddingBottom: '10px', borderBottom: `2px solid ${COLORS.gold}`, textAlign: 'center', fontWeight: '700' }}>اللجان النوعية</h2>
          {Object.entries(committees).map(([key, committee]) => (
            <div key={key} style={{ backgroundColor: COLORS.white, padding: '20px', borderRadius: '10px', marginBottom: '25px', border: '1px solid #E0E0E0', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)' }}>
              <h3 style={{ backgroundColor: COLORS.gold, padding: '12px 15px', borderRadius: '8px', fontSize: '18px', marginBottom: '15px', color: COLORS.white, textAlign: 'center', fontWeight: '700' }}>{committee.name}</h3>

              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: COLORS.darkNavy, marginBottom: '10px', paddingBottom: '8px', borderBottom: `1px solid ${COLORS.gold}` }}>أمين اللجنة</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: COLORS.darkNavy, marginBottom: '5px', display: 'block' }}>الاسم *</label>
                    <input
                      placeholder="الاسم الكامل"
                      value={committee.secretary.fullName}
                      onChange={e => handleCommitteeChange(key as keyof typeof committees, 'secretary', 'fullName', e.target.value)}
                      onBlur={() => handleFieldBlur(`committee_${key}_secretary_name`)}
                      style={inputStyle(hasFieldError(`committee_${key}_secretary_name`))}
                    />
                    {hasFieldError(`committee_${key}_secretary_name`) && (
                      <div style={{ color: COLORS.error, fontSize: '11px', marginTop: '4px' }}>⚠️ {getFieldError(`committee_${key}_secretary_name`)}</div>
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: COLORS.darkNavy, marginBottom: '5px', display: 'block' }}>الرقم القومي *</label>
                    <input
                      placeholder="14 رقم"
                      maxLength={14}
                      value={committee.secretary.nationalId}
                      onChange={e => handleCommitteeChange(key as keyof typeof committees, 'secretary', 'nationalId', e.target.value.replace(/\D/g, ''))}
                      onBlur={() => handleFieldBlur(`committee_${key}_secretary_nationalId`)}
                      style={inputStyle(hasFieldError(`committee_${key}_secretary_nationalId`))}
                    />
                    {hasFieldError(`committee_${key}_secretary_nationalId`) && (
                      <div style={{ color: COLORS.error, fontSize: '11px', marginTop: '4px' }}>⚠️ {getFieldError(`committee_${key}_secretary_nationalId`)}</div>
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: COLORS.darkNavy, marginBottom: '5px', display: 'block' }}>رقم الموبايل *</label>
                    <input
                      placeholder="01XXXXXXXXX"
                      maxLength={11}
                      value={committee.secretary.mobile}
                      onChange={e => handleCommitteeChange(key as keyof typeof committees, 'secretary', 'mobile', e.target.value.replace(/\D/g, ''))}
                      onBlur={() => handleFieldBlur(`committee_${key}_secretary_mobile`)}
                      style={inputStyle(hasFieldError(`committee_${key}_secretary_mobile`))}
                    />
                    {hasFieldError(`committee_${key}_secretary_mobile`) && (
                      <div style={{ color: COLORS.error, fontSize: '11px', marginTop: '4px' }}>⚠️ {getFieldError(`committee_${key}_secretary_mobile`)}</div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: COLORS.darkNavy, marginBottom: '10px', paddingBottom: '8px', borderBottom: `1px solid ${COLORS.gold}` }}>أمين مساعد اللجنة</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: COLORS.darkNavy, marginBottom: '5px', display: 'block' }}>الاسم *</label>
                    <input
                      placeholder="الاسم الكامل"
                      value={committee.assistant.fullName}
                      onChange={e => handleCommitteeChange(key as keyof typeof committees, 'assistant', 'fullName', e.target.value)}
                      onBlur={() => handleFieldBlur(`committee_${key}_assistant_name`)}
                      style={inputStyle(hasFieldError(`committee_${key}_assistant_name`))}
                    />
                    {hasFieldError(`committee_${key}_assistant_name`) && (
                      <div style={{ color: COLORS.error, fontSize: '11px', marginTop: '4px' }}>⚠️ {getFieldError(`committee_${key}_assistant_name`)}</div>
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: COLORS.darkNavy, marginBottom: '5px', display: 'block' }}>الرقم القومي *</label>
                    <input
                      placeholder="14 رقم"
                      maxLength={14}
                      value={committee.assistant.nationalId}
                      onChange={e => handleCommitteeChange(key as keyof typeof committees, 'assistant', 'nationalId', e.target.value.replace(/\D/g, ''))}
                      onBlur={() => handleFieldBlur(`committee_${key}_assistant_nationalId`)}
                      style={inputStyle(hasFieldError(`committee_${key}_assistant_nationalId`))}
                    />
                    {hasFieldError(`committee_${key}_assistant_nationalId`) && (
                      <div style={{ color: COLORS.error, fontSize: '11px', marginTop: '4px' }}>⚠️ {getFieldError(`committee_${key}_assistant_nationalId`)}</div>
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: COLORS.darkNavy, marginBottom: '5px', display: 'block' }}>رقم الموبايل *</label>
                    <input
                      placeholder="01XXXXXXXXX"
                      maxLength={11}
                      value={committee.assistant.mobile}
                      onChange={e => handleCommitteeChange(key as keyof typeof committees, 'assistant', 'mobile', e.target.value.replace(/\D/g, ''))}
                      onBlur={() => handleFieldBlur(`committee_${key}_assistant_mobile`)}
                      style={inputStyle(hasFieldError(`committee_${key}_assistant_mobile`))}
                    />
                    {hasFieldError(`committee_${key}_assistant_mobile`) && (
                      <div style={{ color: COLORS.error, fontSize: '11px', marginTop: '4px' }}>⚠️ {getFieldError(`committee_${key}_assistant_mobile`)}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Footer Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', paddingTop: '20px', borderTop: `2px solid ${COLORS.gold}`, gap: '15px' }}>
          <button
            type="button"
            onClick={() => {
              if (onBack) {
                onBack();
              } else {
                window.history.back();
              }
            }}
            style={{ padding: '12px 30px', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', backgroundColor: '#cccccc', color: COLORS.darkNavy, minWidth: '120px', transition: 'all 0.3s' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#b3b3b3')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#cccccc')}
          >
            العودة
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            style={{ padding: '12px 30px', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', backgroundColor: COLORS.darkNavy, color: COLORS.white, minWidth: '120px', transition: 'all 0.3s' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1d1d4a')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = COLORS.darkNavy)}
          >
            تقديم الطلب
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateFamForm;