"use client";
import React, { useState, useEffect, useCallback } from 'react';
import '../styles/CreateFam.css';
import Toast from './Toast';
import { ChevronRight, ChevronLeft, Check, User, Users, FileText, Send } from 'lucide-react';
import { authFetch } from "@/utils/globalFetch";
const CACHE_KEY = 'createFamFormData';

/* ─── Token decode ─── */
const decodeToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(jsonPayload);
  } catch { return null; }
};

/* ─── API error parser ─── */
const FIELD_LABELS: Record<string, string> = {
  'أخ_أكبر': 'الأخ الأكبر', 'أخت_كبرى': 'الأخت الكبرى',
  'أمين_سر': 'السكرتير / أمين السر', 'عضو_منتخب_1': 'العضو المنتخب الأول',
  'عضو_منتخب_2': 'العضو المنتخب الثاني', 'رائد': 'رائد الأسرة',
  'نائب_رائد': 'نائب الرائد', 'مسؤول': 'مسئول الأسرة',
  'أمين_صندوق': 'أمين الصندوق',
  cultural: 'اللجنة الثقافية', newspaper: 'لجنة صحف الحائط',
  social: 'اللجنة الاجتماعية والرحلات', arts: 'اللجنة الفنية',
  scientific: 'اللجنة العلمية', service: 'لجنة الخدمة العامة والمعسكرات',
  sports: 'اللجنة الرياضية',
  name: 'اسم الأسرة', description: 'وصف الأسرة',
  family_type: 'نوع الأسرة', faculty_id: 'الكلية',
  uid: 'كود الطالب', nid: 'الرقم القومي', ph_no: 'رقم الهاتف',
  non_field_errors: '',
};

const CODE_MESSAGES: Record<string, string> = {
  invalid: 'قيمة غير صالحة',
  unique: 'هذه القيمة مستخدمة بالفعل',
  required: 'هذا الحقل مطلوب',
  null: 'لا يمكن أن يكون هذا الحقل فارغاً',
  blank: 'لا يمكن أن يكون هذا الحقل فارغاً',
  does_not_exist: 'لم يتم العثور على هذا الطالب',
  not_found: 'لم يتم العثور على السجل',
  permission_denied: 'غير مصرح بهذه العملية',
  already_exists: 'هذا السجل موجود بالفعل',
  throttled: 'الرجاء الانتظار قبل المحاولة مرة أخرى',
};

function parseApiError(err: unknown): string[] {
  if (!err || typeof err !== 'object') return ['حدث خطأ غير متوقع'];
  const messages: string[] = [];

  const extract = (obj: unknown, parentKey = ''): void => {
    if (typeof obj === 'string') {
      // strip raw ErrorDetail strings e.g. "[ErrorDetail(string='...', code='invalid')]"
      const strMatch = obj.match(/string='([^']+)'/);
      const codeMatch = obj.match(/code='([^']+)'/);
      const clean = strMatch ? strMatch[1] : obj;
      const code = codeMatch?.[1];
      const display = (code && CODE_MESSAGES[code]) ? CODE_MESSAGES[code] : clean;
      const label = FIELD_LABELS[parentKey] ?? (parentKey || '');
      messages.push(label ? `${label}: ${display}` : display);
      return;
    }
    if (Array.isArray(obj)) {
      obj.forEach(item => extract(item, parentKey));
      return;
    }
    if (typeof obj === 'object' && obj !== null) {
      Object.entries(obj as Record<string, unknown>).forEach(([k, v]) => {
        if (['status', 'status_code'].includes(k)) return;
        extract(v, k);
      });
    }
  };

  extract(err);
  return [...new Set(messages)].filter(Boolean);
}

/* ─── Types ─── */
interface CreateFamFormProps { onBack?: () => void; onSubmitSuccess?: () => void; }
interface Person { fullName: string; nationalId?: string; mobile?: string; studentId?: string; }
interface Activity {
  title: string;
  description: string;
  st_date: string;
  end_date?: string;
  location?: string;
  cost?: string;
}

interface Committee {
  name: string;
  secretary: Person;
  assistant: Person;
  activities: Activity[];
  selectedDeptId?: string;
}
interface Department { dept_id: number; name: string; }
interface FormErrors { [key: string]: string; }
interface ToastNotification { id: number; message: string; type: 'success' | 'error' | 'info' | 'warning'; }

const defaultPerson: Person = { fullName: '', nationalId: '', mobile: '', studentId: '' };

const STEPS = [
  { id: 0, label: 'بيانات الأسرة',   icon: FileText },
  { id: 1, label: 'مجلس الإدارة',    icon: User     },
  { id: 2, label: 'اللجان',          icon: Users    },
  { id: 3, label: 'مراجعة وإرسال',   icon: Send     },
];
const defaultActivity: Activity = {
  title: '',
  description: '',
  st_date: '',
  end_date: '',
  location: '',
  cost: '',
};

const defaultCommittees = {
  cultural:   { name: 'اللجنة الثقافية',               secretary: {...defaultPerson}, assistant: {...defaultPerson}, activities: [{ ...defaultActivity }], selectedDeptId:'' },
  wall:       { name: 'لجنة صحف الحائط',               secretary: {...defaultPerson}, assistant: {...defaultPerson}, activities: [{ ...defaultActivity }], selectedDeptId:'' },
  social:     { name: 'اللجنة الاجتماعية والرحلات',    secretary: {...defaultPerson}, assistant: {...defaultPerson}, activities: [{ ...defaultActivity }], selectedDeptId:'' },
  technical:  { name: 'اللجنة الفنية',                 secretary: {...defaultPerson}, assistant: {...defaultPerson}, activities: [{ ...defaultActivity }], selectedDeptId:'' },
  scientific: { name: 'اللجنة العلمية',                secretary: {...defaultPerson}, assistant: {...defaultPerson}, activities: [{ ...defaultActivity }], selectedDeptId:'' },
  service:    { name: 'لجنة الخدمة العامة والمعسكرات', secretary: {...defaultPerson}, assistant: {...defaultPerson}, activities: [{ ...defaultActivity }], selectedDeptId:'' },
  sports:     { name: 'اللجنة الرياضية',               secretary: {...defaultPerson}, assistant: {...defaultPerson}, activities: [{ ...defaultActivity }], selectedDeptId:'' },
};

const defaultBoard = {
  leader:      {...defaultPerson}, viceLeader:  {...defaultPerson},
  responsible: {...defaultPerson}, treasurer:   {...defaultPerson},
  elderBrother:{...defaultPerson}, elderSister: {...defaultPerson},
  secretary:   {...defaultPerson}, elected1:    {...defaultPerson}, elected2: {...defaultPerson},
};

const boardLabels: Record<string, string> = {
  leader:'رائد الأسرة', viceLeader:'نائب الرائد', responsible:'مسئول الأسرة',
  treasurer:'أمين الصندوق', elderBrother:'الأخ الأكبر', elderSister:'الأخت الكبرى',
  secretary:'السكرتير / أمين السر', elected1:'عضو منتخب (1)', elected2:'عضو منتخب (2)',
};
const committeeKeys: Record<string, string> = {
  cultural:'cultural', wall:'newspaper', social:'social', technical:'arts',
  scientific:'scientific', service:'service', sports:'sports',
};
const requiresFullInfo = ['leader', 'viceLeader', 'responsible', 'treasurer'];

const CreateFamForm: React.FC<CreateFamFormProps> = ({ onBack, onSubmitSuccess }) => {
  const [step, setStep]                           = useState(0);
  const [familyType, setFamilyType]               = useState('');
  const [familyName, setFamilyName]               = useState('');
  const [familyGoals, setFamilyGoals]             = useState('');
  const [familyDescription, setFamilyDescription] = useState('');
  const [boardMembers, setBoardMembers]           = useState(defaultBoard);
  const [committees, setCommittees]               = useState<Record<string, Committee>>(defaultCommittees);
  const [errors, setErrors]                       = useState<FormErrors>({});
  const [facultyId, setFacultyId]                 = useState<number|null>(null);
  const [departments, setDepartments]             = useState<Department[]>([]);
  const [isSubmitting, setIsSubmitting]           = useState(false);
  const [toasts, setToasts]                       = useState<ToastNotification[]>([]);

  const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
  const handleActivityChange = (ck: string, ai: number, field: keyof Activity, value: string) => {
    setCommittees(prev => {
      const updated = { ...prev };
      updated[ck].activities[ai][field] = value;
      return updated;
    });
  };

const addActivity = (ck: string) => {
  setCommittees(prev => ({
    ...prev,
    [ck]: {
      ...prev[ck],
      activities: [...prev[ck].activities, { ...defaultActivity }]
    }
  }));
};

const removeActivity = (ck: string, ai: number) => {
  setCommittees(prev => {
    const updated = { ...prev };

    updated[ck] = {
      ...updated[ck],
      activities: updated[ck].activities.filter((_, i) => i !== ai),
    };

    return updated;
  });
};
  /* ── Cache load ── */
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const d = JSON.parse(cached);
        if (d.familyType)        setFamilyType(d.familyType);
        if (d.familyName)        setFamilyName(d.familyName);
        if (d.familyGoals)       setFamilyGoals(d.familyGoals);
        if (d.familyDescription) setFamilyDescription(d.familyDescription);
        if (d.boardMembers)      setBoardMembers(d.boardMembers);
        if (d.committees)        setCommittees(d.committees);
      }
    } catch {}
  }, []);

  /* ── Cache save ── */
  const saveCache = useCallback(() => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        familyType, familyName, familyGoals, familyDescription, boardMembers, committees,
      }));
    } catch {}
  }, [familyType, familyName, familyGoals, familyDescription, boardMembers, committees]);
  useEffect(() => { saveCache(); }, [saveCache]);

  /* ── Toast ── */
  const showToast = (message: string, type: ToastNotification['type']) => {
    setToasts(prev => [...prev, { id: Date.now(), message, type }]);
  };
  const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  /* ── Fetch deps & profile ── */
  useEffect(() => {
    if (!token) return;
    authFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/family/departments/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (!data) return; const d = Array.isArray(data) ? data : data.departments ?? data.results ?? []; setDepartments(d); })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const decoded = decodeToken(token);
    authFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/profile/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        const fid = (data.faculty && data.faculty !== 0) ? data.faculty : decoded?.faculty_id ?? null;
        if (fid) setFacultyId(fid);
      }).catch(() => {});
  }, [token]);

  /* ── Validation ── */
  const validateStep = (s: number): FormErrors => {
    const e: FormErrors = {};
    if (s === 0) {
      if (!familyType) e.familyType = 'يرجى اختيار نوع الأسرة';
      if (!familyName.trim()) e.familyName = 'يرجى إدخال اسم الأسرة';
      else if (familyName.trim().length < 3) e.familyName = 'اسم الأسرة يجب أن يكون 3 أحرف على الأقل';
      if (!familyDescription.trim()) e.familyDescription = 'يرجى إدخال وصف الأسرة';
      else if (familyDescription.trim().length < 10) e.familyDescription = 'الوصف يجب أن يكون 10 أحرف على الأقل';
    }
    if (s === 1) {
      requiresFullInfo.forEach(key => {
        const m = boardMembers[key as keyof typeof boardMembers];
        if (!m.fullName.trim()) e[`board_${key}_fullName`] = 'الاسم مطلوب';
        else if (m.fullName.trim().length < 3) e[`board_${key}_fullName`] = 'الاسم يجب أن يكون 3 أحرف على الأقل';
        if (!m.nationalId) e[`board_${key}_nationalId`] = 'الرقم القومي مطلوب';
        else if (m.nationalId.length !== 14 || !/^\d+$/.test(m.nationalId)) e[`board_${key}_nationalId`] = 'الرقم القومي يجب أن يكون 14 رقماً';
        if (!m.mobile) e[`board_${key}_mobile`] = 'رقم الموبايل مطلوب';
        else if (!/^01[0-2,5]{1}[0-9]{8}$/.test(m.mobile)) e[`board_${key}_mobile`] = 'رقم الموبايل غير صحيح (مثال: 01XXXXXXXXX)';
      });
    }
    return e;
  };

  const goNext = () => {
    const e = validateStep(step);
    if (Object.keys(e).length) {
      setErrors(e);
      showToast(`يوجد ${Object.keys(e).length} خطأ في البيانات، يرجى المراجعة`, 'error');
      // scroll to first error
      setTimeout(() => {
        const el = document.querySelector('.cf-error, .cf-err-msg');
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }
    setErrors({});
    setStep(s => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goPrev = () => {
    setErrors({});
    setStep(s => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── Board / Committee helpers ── */
  const handleBoardChange = (key: keyof typeof boardMembers, field: string, value: string) => {
    setBoardMembers(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
    setErrors(prev => { const n = {...prev}; delete n[`board_${key}_${field}`]; return n; });
  };
  const handleCommitteeChange = (ck: string, role: 'secretary'|'assistant', field: keyof Person, value: string) => {
    setCommittees(prev => ({ ...prev, [ck]: { ...prev[ck], [role]: { ...prev[ck][role], [field]: value } } }));
  };
  const handleCommitteeFieldChange = (ck: string, field: string, value: string) => {
    setCommittees(prev => ({ ...prev, [ck]: { ...prev[ck], [field]: value } }));
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (!token) { showToast('يرجى تسجيل الدخول أولاً', 'error'); return; }

      const committeesData = Object.entries(committees).map(([key, c]) => {
        const deptId = c.selectedDeptId ? parseInt(c.selectedDeptId) : (facultyId || 0);
     const activities = c.activities
  .filter(a => a.title.trim() && a.st_date)  // skip blank/incomplete activities
  .map(a => ({
    title: a.title.trim(),
    description: a.description || '',
    st_date: a.st_date,                        // already YYYY-MM-DD from <input type="date">
    end_date: a.end_date || a.st_date,         // fallback to st_date if end_date empty
    location: a.location || '',
    cost: a.cost || '0',
  }));
        return {
          committee_key: committeeKeys[key] || key,
          head:      { uid: parseInt(c.secretary.studentId||'0'), dept_id: deptId },
          assistant: { uid: parseInt(c.assistant.studentId||'0'), dept_id: deptId },
          activities,
        };
      });

      const payload = {
        family_type: familyType, name: familyName, description: familyDescription,
        min_limit: 15, faculty_id: facultyId || 0,
        default_roles: {
          رائد:        { name: boardMembers.leader.fullName,      nid: parseInt(boardMembers.leader.nationalId||'0'),      ph_no: parseInt(boardMembers.leader.mobile||'0') },
          نائب_رائد:   { name: boardMembers.viceLeader.fullName,  nid: parseInt(boardMembers.viceLeader.nationalId||'0'),  ph_no: parseInt(boardMembers.viceLeader.mobile||'0') },
          مسؤول:       { name: boardMembers.responsible.fullName, nid: parseInt(boardMembers.responsible.nationalId||'0'), ph_no: parseInt(boardMembers.responsible.mobile||'0') },
          أمين_صندوق:  { name: boardMembers.treasurer.fullName,   nid: parseInt(boardMembers.treasurer.nationalId||'0'),   ph_no: parseInt(boardMembers.treasurer.mobile||'0') },
          أخ_أكبر:     { uid: parseInt(boardMembers.elderBrother.studentId||'0') },
          أخت_كبرى:    { uid: parseInt(boardMembers.elderSister.studentId||'0') },
          أمين_سر:     { uid: parseInt(boardMembers.secretary.studentId||'0') },
          عضو_منتخب_1: { uid: parseInt(boardMembers.elected1.studentId||'0') },
          عضو_منتخب_2: { uid: parseInt(boardMembers.elected2.studentId||'0') },
        },
        committees: committeesData,
      };

      const res = await authFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/family/student/create/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        localStorage.removeItem(CACHE_KEY);
        showToast('تم إرسال طلبك بنجاح! 🎉 يرجى انتظار مراجعته', 'success');
        setTimeout(() => { if (onSubmitSuccess) onSubmitSuccess(); }, 2000);
      } else {
        let errData: Record<string, unknown> = {};
        try { errData = await res.json(); } catch {}

        // Parse into human-readable lines
        const lines = parseApiError(errData);

        if (lines.length === 1) {
          showToast(lines[0], 'error');
        } else {
          // Show first error as toast, rest are displayed in an inline error banner
          showToast(lines[0], 'error');
          // also set a special multi-error state if needed — show all as separate toasts spaced
          lines.slice(1).forEach((line, i) => {
            setTimeout(() => showToast(line, 'error'), (i + 1) * 600);
          });
        }
      }
    } catch {
      showToast('فشل الاتصال بالخادم، تحقق من الاتصال بالإنترنت', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ════════════════ STEP RENDERS ════════════════ */

  const renderStep0 = () => (
    <div className="cf-step-content">
      <h2 className="cf-step-title">بيانات الأسرة الأساسية</h2>
      <div className="cf-grid-2">
        <div className="cf-field">
          <label className="cf-label">نوع الأسرة <span className="cf-req">*</span></label>
          <select
            className={`cf-input cf-select${errors.familyType ? ' cf-error' : ''}`}
            value={familyType}
            onChange={e => { setFamilyType(e.target.value); setErrors(p => { const n={...p}; delete n.familyType; return n; }); }}
          >
            <option value="">اختر نوع الأسرة</option>
            <option value="نوعية">نوعية</option>
            <option value="مركزية">مركزية</option>
          </select>
          {errors.familyType && <p className="cf-err-msg"><span className="cf-err-icon">⚠</span> {errors.familyType}</p>}
        </div>

        <div className="cf-field">
          <label className="cf-label">اسم الأسرة <span className="cf-req">*</span></label>
          <input
            className={`cf-input${errors.familyName ? ' cf-error' : ''}`}
            placeholder="أدخل اسم الأسرة"
            value={familyName}
            onChange={e => { setFamilyName(e.target.value); setErrors(p => { const n={...p}; delete n.familyName; return n; }); }}
          />
          {errors.familyName && <p className="cf-err-msg"><span className="cf-err-icon">⚠</span> {errors.familyName}</p>}
        </div>
      </div>

      <div className="cf-field">
        <label className="cf-label">أهداف الأسرة</label>
        <textarea
          className="cf-input cf-textarea"
          placeholder="اذكر أهداف الأسرة"
          rows={3}
          value={familyGoals}
          onChange={e => setFamilyGoals(e.target.value)}
        />
      </div>

      <div className="cf-field">
        <label className="cf-label">وصف الأسرة <span className="cf-req">*</span></label>
        <textarea
          className={`cf-input cf-textarea${errors.familyDescription ? ' cf-error' : ''}`}
          placeholder="قدم وصفاً تفصيلياً للأسرة ونشاطاتها"
          rows={4}
          value={familyDescription}
          onChange={e => { setFamilyDescription(e.target.value); setErrors(p => { const n={...p}; delete n.familyDescription; return n; }); }}
        />
        {errors.familyDescription && <p className="cf-err-msg"><span className="cf-err-icon">⚠</span> {errors.familyDescription}</p>}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="cf-step-content">
      <h2 className="cf-step-title">مجلس إدارة الأسرة</h2>

      {/* Error summary banner if there are board errors */}
      {Object.keys(errors).some(k => k.startsWith('board_')) && (
        <div className="cf-error-banner">
          <span className="cf-error-banner-icon">⚠</span>
          <div>
            <strong>يوجد خطأ في البيانات التالية:</strong>
            <ul className="cf-error-list">
              {Object.entries(errors)
                .filter(([k]) => k.startsWith('board_'))
                .map(([k, v]) => {
                  const parts = k.split('_');
                  const roleKey = parts[1];
                  const role = boardLabels[roleKey] ?? roleKey;
                  return <li key={k}>{role}: {v}</li>;
                })}
            </ul>
          </div>
        </div>
      )}

      <div className="cf-members-grid">
        {Object.entries(boardMembers).map(([key, person]) => {
          const full = requiresFullInfo.includes(key);
          const hasErr = Object.keys(errors).some(k => k.startsWith(`board_${key}_`));
          return (
            <div key={key} className={`cf-member-card ${full ? 'cf-member-full' : ''} ${hasErr ? 'cf-member-card-error' : ''}`}>
              <div className="cf-member-header">
                <User size={15} />
                <span>{boardLabels[key]}</span>
                {hasErr && <span className="cf-member-error-badge">يوجد خطأ</span>}
              </div>
              {full ? (
                <div className="cf-member-fields">
                  <div className="cf-field">
                    <label className="cf-label">الاسم الكامل <span className="cf-req">*</span></label>
                    <input
                      className={`cf-input${errors[`board_${key}_fullName`] ? ' cf-error' : ''}`}
                      placeholder="الاسم الكامل"
                      value={person.fullName}
                      onChange={e => handleBoardChange(key as keyof typeof boardMembers, 'fullName', e.target.value)}
                    />
                    {errors[`board_${key}_fullName`] && <p className="cf-err-msg"><span className="cf-err-icon">⚠</span> {errors[`board_${key}_fullName`]}</p>}
                  </div>
                  <div className="cf-field">
                    <label className="cf-label">الرقم القومي <span className="cf-req">*</span></label>
                    <input
                      className={`cf-input${errors[`board_${key}_nationalId`] ? ' cf-error' : ''}`}
                      placeholder="14 رقماً"
                      maxLength={14}
                      value={person.nationalId || ''}
                      onChange={e => handleBoardChange(key as keyof typeof boardMembers, 'nationalId', e.target.value.replace(/\D/g, ''))}
                    />
                    {errors[`board_${key}_nationalId`] && <p className="cf-err-msg"><span className="cf-err-icon">⚠</span> {errors[`board_${key}_nationalId`]}</p>}
                  </div>
                  <div className="cf-field">
                    <label className="cf-label">رقم الموبايل <span className="cf-req">*</span></label>
                    <input
                      className={`cf-input${errors[`board_${key}_mobile`] ? ' cf-error' : ''}`}
                      placeholder="01XXXXXXXXX"
                      maxLength={11}
                      value={person.mobile || ''}
                      onChange={e => handleBoardChange(key as keyof typeof boardMembers, 'mobile', e.target.value.replace(/\D/g, ''))}
                    />
                    {errors[`board_${key}_mobile`] && <p className="cf-err-msg"><span className="cf-err-icon">⚠</span> {errors[`board_${key}_mobile`]}</p>}
                  </div>
                </div>
              ) : (
                <div className="cf-field">
                  <label className="cf-label">كود الطالب</label>
                  <input
                    className="cf-input"
                    placeholder="أدخل كود الطالب"
                    value={person.studentId || ''}
                    onChange={e => handleBoardChange(key as keyof typeof boardMembers, 'studentId', e.target.value)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="cf-step-content">
      <h2 className="cf-step-title">اللجان</h2>
      <div className="cf-committees-list">
        {Object.entries(committees).map(([key, c]) => (
          <details key={key} className="cf-committee">
            <summary className="cf-committee-summary">
              <span className="cf-committee-dot" />
              <span>{c.name}</span>
              <ChevronLeft size={16} className="cf-committee-chevron" />
            </summary>
            <div className="cf-committee-body">
                      <div className="cf-grid-2">
                <div className="cf-field">
                  <label className="cf-label">كود أمين اللجنة</label>
                  <input
                    className="cf-input"
                    placeholder="كود الطالب"
                    value={c.secretary.studentId || ''}
                    onChange={e => handleCommitteeChange(key, 'secretary', 'studentId', e.target.value)}
                  />
                </div>
                <div className="cf-field">
                  <label className="cf-label">كود أمين مساعد اللجنة</label>
                  <input
                    className="cf-input"
                    placeholder="كود الطالب"
                    value={c.assistant.studentId || ''}
                    onChange={e => handleCommitteeChange(key, 'assistant', 'studentId', e.target.value)}
                  />
                </div>
              </div>
              <div className="cf-grid-2">
                <div className="cf-field">
                  <label className="cf-label">القسم المسؤول</label>
                  <select
                    className="cf-input cf-select"
                    value={c.selectedDeptId || ''}
                    onChange={e => handleCommitteeFieldChange(key, 'selectedDeptId', e.target.value)}
                  >
                    <option value="">اختر القسم</option>
                    {departments.map(d => <option key={d.dept_id} value={d.dept_id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
             {c.activities.map((a, ai) => (
          <div key={ai} className="cf-activity-card">
            
            <div className="cf-activity-header">
              <span>مشروع {ai + 1}</span>
              <button
                type="button"
                onClick={() => removeActivity(key, ai)}
                className="cf-delete-btn"
              >
                حذف
              </button>
            </div>

            <div className="cf-grid-2">
              <div className="cf-field">
                <label className="cf-label">اسم المشروع</label>
                <input
                  className="cf-input"
                  placeholder="اسم المشروع"
                  value={a.title}
                  onChange={(e) => handleActivityChange(key, ai, "title", e.target.value)}
                />
              </div>

           <div className="cf-field">
  <label className="cf-label">تاريخ البداية <span className="cf-req">*</span></label>
  <input
    type="date"
    className="cf-input"
    value={a.st_date}
    onChange={(e) => handleActivityChange(key, ai, "st_date", e.target.value)}
  />
</div>

<div className="cf-field">
  <label className="cf-label">تاريخ النهاية <span className="cf-req">*</span></label>
  <input
    type="date"
    className="cf-input"
    value={a.end_date || ''}
    onChange={(e) => handleActivityChange(key, ai, "end_date", e.target.value)}
  />
</div>

              <div className="cf-field">
                <label className="cf-label">مصادر التمويل</label>
                <input
                  className="cf-input"
                  placeholder="مصادر التمويل"
                  value={a.description}
                  onChange={(e) => handleActivityChange(key, ai, "description", e.target.value)}
                />
              </div>
            </div>

          </div>
        ))}

        <button
          type="button"
          className="cf-btn-add"
          onClick={() => addActivity(key)}
        >
          + إضافة مشروع جديد
        </button>
            </div>
          </details>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="cf-step-content">
      <h2 className="cf-step-title">مراجعة البيانات</h2>
      <div className="cf-review">
        <div className="cf-review-section">
          <h3 className="cf-review-heading">بيانات الأسرة</h3>
          <div className="cf-review-grid">
            <div className="cf-review-item"><span className="cf-review-key">النوع</span><span className="cf-review-val">{familyType||'—'}</span></div>
            <div className="cf-review-item"><span className="cf-review-key">الاسم</span><span className="cf-review-val">{familyName||'—'}</span></div>
            <div className="cf-review-item cf-review-full"><span className="cf-review-key">الوصف</span><span className="cf-review-val">{familyDescription||'—'}</span></div>
            {familyGoals && <div className="cf-review-item cf-review-full"><span className="cf-review-key">الأهداف</span><span className="cf-review-val">{familyGoals}</span></div>}
          </div>
        </div>
        <div className="cf-review-section">
          <h3 className="cf-review-heading">مجلس الإدارة</h3>
          <div className="cf-review-grid">
            {Object.entries(boardMembers).map(([key, p]) => (
              <div key={key} className="cf-review-item">
                <span className="cf-review-key">{boardLabels[key]}</span>
                <span className="cf-review-val">{p.fullName || p.studentId || '—'}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="cf-review-section">
          <h3 className="cf-review-heading">اللجان</h3>
          <div className="cf-review-grid">
            {Object.entries(committees).map(([, c]) => (
              <div key={c.name} className="cf-review-item">
                <span className="cf-review-key">{c.name}</span>
                <span className="cf-review-val">{c.secretary.studentId ? `أمين: ${c.secretary.studentId}` : '—'}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="cf-review-note">
          <Check size={16} /> تأكد من صحة جميع البيانات قبل الإرسال. لا يمكن التعديل بعد التقديم.
        </div>
      </div>
    </div>
  );

  const stepRenderers = [renderStep0, renderStep1, renderStep2, renderStep3];

  return (
    <div className="cf-page">
      <div className="toast-container">
        {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />)}
      </div>

      <div className="cf-wizard">
        {/* Progress Header */}
        <div className="cf-progress-header">
          <div className="cf-progress-top">
            <button className="cf-back-page" onClick={onBack}>
              <ChevronRight size={16} /> العودة للقائمة
            </button>
            <h1 className="cf-wizard-title">نموذج إنشاء أسرة طلابية</h1>
            <span className="cf-step-count">{step + 1} / {STEPS.length}</span>
          </div>

          <div className="cf-steps">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = i < step, active = i === step;
              return (
                <React.Fragment key={s.id}>
                  <div className={`cf-step-indicator ${active ? 'cf-step-active' : done ? 'cf-step-done' : 'cf-step-pending'}`}>
                    <div className="cf-step-circle">
                      {done ? <Check size={14} /> : <Icon size={14} />}
                    </div>
                    <span className="cf-step-label">{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className={`cf-step-line ${i < step ? 'cf-line-done' : ''}`} />}
                </React.Fragment>
              );
            })}
          </div>

          <div className="cf-progress-bar">
            <div className="cf-progress-fill" style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }} />
          </div>
        </div>

        {/* Step Body */}
        <div className="cf-body">
          {stepRenderers[step]()}
        </div>

        {/* Footer */}
        <div className="cf-footer">
          <button className="cf-btn-ghost" onClick={goPrev} disabled={step === 0}>
            <ChevronRight size={16} /> السابق
          </button>

          <div className="cf-footer-dots">
            {STEPS.map((_, i) => <span key={i} className={`cf-dot ${i === step ? 'cf-dot-active' : i < step ? 'cf-dot-done' : ''}`} />)}
          </div>

          {step < STEPS.length - 1 ? (
            <button className="cf-btn-primary" onClick={goNext}>
              التالي <ChevronLeft size={16} />
            </button>
          ) : (
            <button className="cf-btn-submit" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'جاري الإرسال...' : <><Send size={15} /> إرسال الطلب</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateFamForm;