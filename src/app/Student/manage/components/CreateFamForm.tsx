"use client";
import React, { useState } from 'react';
import '../styles/CreateFam.css';

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

  const requiresFullInfo = ['leader', 'viceLeader', 'responsible', 'treasurer'];

  const validateNationalId = (id: string) => /^\d{14}$/.test(id);
  const validatePhoneNumber = (phone: string) => /^01\d{9}$/.test(phone);
  const validateStudentId = (id: string) => id.trim().length >= 3;
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
      if (!familyName || !familyName.trim()) {
        addError('familyName', 'اسم الأسرة مطلوب');
      } else if (!validateTextField(familyName, 3)) {
        addError('familyName', 'اسم الأسرة يجب أن يكون 3 أحرف على الأقل');
      } else {
        clearError('familyName');
      }
    } else if (fieldName === 'familyGoals') {
      if (!familyGoals || !familyGoals.trim()) {
        addError('familyGoals', 'أهداف الأسرة مطلوبة');
      } else if (!validateTextField(familyGoals, 10)) {
        addError('familyGoals', 'أهداف الأسرة يجب أن تكون 10 أحرف على الأقل');
      } else {
        clearError('familyGoals');
      }
    } else if (fieldName === 'familyDescription') {
      if (!familyDescription || !familyDescription.trim()) {
        addError('familyDescription', 'وصف الأسرة مطلوب');
      } else if (!validateTextField(familyDescription, 10)) {
        addError('familyDescription', 'وصف الأسرة يجب أن يكون 10 أحرف على الأقل');
      } else {
        clearError('familyDescription');
      }
    }
  };

  const validatePerson = (person: Person, prefix: string, isFullInfo: boolean): boolean => {
    let isValid = true;

    if (!person.fullName || !person.fullName.trim()) {
      addError(`${prefix}_name`, 'الاسم مطلوب');
      isValid = false;
    } else if (!validateTextField(person.fullName, 3)) {
      addError(`${prefix}_name`, 'الاسم يجب أن يكون 3 أحرف على الأقل');
      isValid = false;
    } else {
      clearError(`${prefix}_name`);
    }

    if (isFullInfo) {
      if (!person.nationalId || !person.nationalId.trim()) {
        addError(`${prefix}_nationalId`, 'الرقم القومي مطلوب');
        isValid = false;
      } else if (!validateNationalId(person.nationalId)) {
        addError(`${prefix}_nationalId`, 'الرقم القومي يجب أن يكون بالضبط 14 رقم');
        isValid = false;
      } else {
        clearError(`${prefix}_nationalId`);
      }

      if (!person.mobile || !person.mobile.trim()) {
        addError(`${prefix}_mobile`, 'رقم الموبايل مطلوب');
        isValid = false;
      } else if (!validatePhoneNumber(person.mobile)) {
        addError(`${prefix}_mobile`, 'رقم الموبايل يجب أن يكون 01XXXXXXXXX (11 رقم)');
        isValid = false;
      } else {
        clearError(`${prefix}_mobile`);
      }
    } else {
      if (!person.studentId || !person.studentId.trim()) {
        addError(`${prefix}_studentId`, 'كود الطالب مطلوب');
        isValid = false;
      } else if (!validateStudentId(person.studentId)) {
        addError(`${prefix}_studentId`, 'كود الطالب غير صالح');
        isValid = false;
      } else {
        clearError(`${prefix}_studentId`);
      }
    }

    return isValid;
  };

  const validateForm = (): boolean => {
    let isValid = true;
    setErrors({});

    if (!familyName || !familyName.trim()) {
      addError('familyName', 'اسم الأسرة مطلوب');
      isValid = false;
    } else if (!validateTextField(familyName, 3)) {
      addError('familyName', 'اسم الأسرة يجب أن يكون 3 أحرف على الأقل');
      isValid = false;
    }

    if (!familyGoals || !familyGoals.trim()) {
      addError('familyGoals', 'أهداف الأسرة مطلوبة');
      isValid = false;
    } else if (!validateTextField(familyGoals, 10)) {
      addError('familyGoals', 'أهداف الأسرة يجب أن تكون 10 أحرف على الأقل');
      isValid = false;
    }

    if (!familyDescription || !familyDescription.trim()) {
      addError('familyDescription', 'وصف الأسرة مطلوب');
      isValid = false;
    } else if (!validateTextField(familyDescription, 10)) {
      addError('familyDescription', 'وصف الأسرة يجب أن يكون 10 أحرف على الأقل');
      isValid = false;
    }

    Object.entries(boardMembers).forEach(([key, person]) => {
      const isFullInfo = requiresFullInfo.includes(key);
      if (!validatePerson(person, `board_${key}`, isFullInfo)) {
        isValid = false;
      }
    });

    Object.entries(committees).forEach(([key, committee]) => {
      if (!validatePerson(committee.secretary, `committee_${key}_secretary`, false)) {
        isValid = false;
      }
      if (!validatePerson(committee.assistant, `committee_${key}_assistant`, false)) {
        isValid = false;
      }
    });

    return isValid;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const allFields = new Set<string>();
    allFields.add('familyName');
    allFields.add('familyGoals');
    allFields.add('familyDescription');

    Object.keys(boardMembers).forEach(key => {
      allFields.add(`board_${key}_name`);
      if (requiresFullInfo.includes(key)) {
        allFields.add(`board_${key}_nationalId`);
        allFields.add(`board_${key}_mobile`);
      } else {
        allFields.add(`board_${key}_studentId`);
      }
    });

    Object.keys(committees).forEach(key => {
      allFields.add(`committee_${key}_secretary_name`);
      allFields.add(`committee_${key}_secretary_studentId`);
      allFields.add(`committee_${key}_assistant_name`);
      allFields.add(`committee_${key}_assistant_studentId`);
    });

    setTouchedFields(allFields);

    const isValid = validateForm();

    if (!isValid) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const formData = {
      familyName,
      familyGoals,
      familyDescription,
      boardMembers,
      committees,
      submittedAt: new Date().toISOString()
    };

    console.log("Form submitted:", formData);

    localStorage.setItem("familyRequestData", JSON.stringify(formData));
    localStorage.setItem("familyRequestStatus", "pending");
    localStorage.setItem("familyRequestSubmitted", "true");

    setErrors({});
    setTouchedFields(new Set());

    if (onSubmitSuccess) {
      onSubmitSuccess();
    }
  };

  const getFieldError = (fieldName: string) => errors[fieldName] || '';
  const isFieldTouched = (fieldName: string) => touchedFields.has(fieldName);
  const hasFieldError = (fieldName: string) => isFieldTouched(fieldName) && !!errors[fieldName];

  return (
    <div className="create-fam-container">
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
              className={`form-input ${hasFieldError('familyName') ? 'error' : ''}`}
              value={familyName}
              onChange={e => setFamilyName(e.target.value)}
              onBlur={() => handleFieldBlur('familyName')}
              placeholder="أدخل اسم الأسرة"
            />
            {hasFieldError('familyName') && (
              <div className="error-message">
                <span>⚠️</span>
                <span>{getFieldError('familyName')}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>أهداف الأسرة *</label>
            <textarea
              className={`form-textarea ${hasFieldError('familyGoals') ? 'error' : ''}`}
              value={familyGoals}
              onChange={e => setFamilyGoals(e.target.value)}
              onBlur={() => handleFieldBlur('familyGoals')}
              rows={4}
              placeholder="اذكر أهداف الأسرة بشكل واضح ومفصل"
            />
            {hasFieldError('familyGoals') && (
              <div className="error-message">
                <span>⚠️</span>
                <span>{getFieldError('familyGoals')}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>وصف الأسرة *</label>
            <textarea
              className={`form-textarea ${hasFieldError('familyDescription') ? 'error' : ''}`}
              value={familyDescription}
              onChange={e => setFamilyDescription(e.target.value)}
              onBlur={() => handleFieldBlur('familyDescription')}
              rows={5}
              placeholder="قدم وصفاً تفصيلياً للأسرة ونشاطاتها"
            />
            {hasFieldError('familyDescription') && (
              <div className="error-message">
                <span>⚠️</span>
                <span>{getFieldError('familyDescription')}</span>
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
                  <div className="field-wrapper">
                    <label>الاسم *</label>
                    <input
                      className={hasFieldError(`board_${key}_name`) ? 'error' : ''}
                      placeholder="الاسم الكامل"
                      value={person.fullName}
                      onChange={e => handleBoardChange(key as keyof typeof boardMembers, 'fullName', e.target.value)}
                      onBlur={() => handleFieldBlur(`board_${key}_name`)}
                    />
                    {hasFieldError(`board_${key}_name`) && (
                      <div className="field-error">⚠️ {getFieldError(`board_${key}_name`)}</div>
                    )}
                  </div>

                  {isFullInfo ? (
                    <>
                      <div className="field-wrapper">
                        <label>الرقم القومي *</label>
                        <input
                          className={hasFieldError(`board_${key}_nationalId`) ? 'error' : ''}
                          placeholder="14 رقم"
                          maxLength={14}
                          value={person.nationalId || ''}
                          onChange={e => handleBoardChange(key as keyof typeof boardMembers, 'nationalId', e.target.value.replace(/\D/g, ''))}
                          onBlur={() => handleFieldBlur(`board_${key}_nationalId`)}
                        />
                        {hasFieldError(`board_${key}_nationalId`) && (
                          <div className="field-error">⚠️ {getFieldError(`board_${key}_nationalId`)}</div>
                        )}
                      </div>
                      <div className="field-wrapper">
                        <label>رقم الموبايل *</label>
                        <input
                          className={hasFieldError(`board_${key}_mobile`) ? 'error' : ''}
                          placeholder="01XXXXXXXXX"
                          maxLength={11}
                          value={person.mobile || ''}
                          onChange={e => handleBoardChange(key as keyof typeof boardMembers, 'mobile', e.target.value.replace(/\D/g, ''))}
                          onBlur={() => handleFieldBlur(`board_${key}_mobile`)}
                        />
                        {hasFieldError(`board_${key}_mobile`) && (
                          <div className="field-error">⚠️ {getFieldError(`board_${key}_mobile`)}</div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="field-wrapper">
                      <label>كود الطالب *</label>
                      <input
                        className={hasFieldError(`board_${key}_studentId`) ? 'error' : ''}
                        placeholder="أدخل كود الطالب"
                        value={person.studentId || ''}
                        onChange={e => handleBoardChange(key as keyof typeof boardMembers, 'studentId', e.target.value)}
                        onBlur={() => handleFieldBlur(`board_${key}_studentId`)}
                      />
                      {hasFieldError(`board_${key}_studentId`) && (
                        <div className="field-error">⚠️ {getFieldError(`board_${key}_studentId`)}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {/* Committees */}
        <section className="form-section">
          <h2 className="section-title">اللجان النوعية</h2>
          {Object.entries(committees).map(([key, committee]) => (
            <div key={key} className="committee-card">
              <div className="committee-name-header">{committee.name}</div>

              <div className="committee-role-section">
                <h4 className="committee-role-title">أمين اللجنة</h4>
                <div className="member-fields">
                  <div className="field-wrapper">
                    <label>الاسم *</label>
                    <input
                      className={hasFieldError(`committee_${key}_secretary_name`) ? 'error' : ''}
                      placeholder="الاسم الكامل"
                      value={committee.secretary.fullName}
                      onChange={e => handleCommitteeChange(key, 'secretary', 'fullName', e.target.value)}
                      onBlur={() => handleFieldBlur(`committee_${key}_secretary_name`)}
                    />
                    {hasFieldError(`committee_${key}_secretary_name`) && (
                      <div className="field-error">⚠️ {getFieldError(`committee_${key}_secretary_name`)}</div>
                    )}
                  </div>
                  <div className="field-wrapper">
                    <label>كود الطالب *</label>
                    <input
                      className={hasFieldError(`committee_${key}_secretary_studentId`) ? 'error' : ''}
                      placeholder="أدخل كود الطالب"
                      value={committee.secretary.studentId || ''}
                      onChange={e => handleCommitteeChange(key, 'secretary', 'studentId', e.target.value)}
                      onBlur={() => handleFieldBlur(`committee_${key}_secretary_studentId`)}
                    />
                    {hasFieldError(`committee_${key}_secretary_studentId`) && (
                      <div className="field-error">⚠️ {getFieldError(`committee_${key}_secretary_studentId`)}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="committee-role-section">
                <h4 className="committee-role-title">أمين مساعد اللجنة</h4>
                <div className="member-fields">
                  <div className="field-wrapper">
                    <label>الاسم *</label>
                    <input
                      className={hasFieldError(`committee_${key}_assistant_name`) ? 'error' : ''}
                      placeholder="الاسم الكامل"
                      value={committee.assistant.fullName}
                      onChange={e => handleCommitteeChange(key, 'assistant', 'fullName', e.target.value)}
                      onBlur={() => handleFieldBlur(`committee_${key}_assistant_name`)}
                    />
                    {hasFieldError(`committee_${key}_assistant_name`) && (
                      <div className="field-error">⚠️ {getFieldError(`committee_${key}_assistant_name`)}</div>
                    )}
                  </div>
                  <div className="field-wrapper">
                    <label>كود الطالب *</label>
                    <input
                      className={hasFieldError(`committee_${key}_assistant_studentId`) ? 'error' : ''}
                      placeholder="أدخل كود الطالب"
                      value={committee.assistant.studentId || ''}
                      onChange={e => handleCommitteeChange(key, 'assistant', 'studentId', e.target.value)}
                      onBlur={() => handleFieldBlur(`committee_${key}_assistant_studentId`)}
                    />
                    {hasFieldError(`committee_${key}_assistant_studentId`) && (
                      <div className="field-error">⚠️ {getFieldError(`committee_${key}_assistant_studentId`)}</div>
                    )}
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
        </section>

        {/* Footer Buttons */}
        <div className="form-footer">
          <button
            type="button"
            className="btn-back"
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
          <button type="submit" className="btn-submit">
            تقديم الطلب
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateFamForm;