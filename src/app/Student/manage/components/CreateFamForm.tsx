"use client";
import React, { useState, useEffect, useCallback } from 'react';
import '../styles/CreateFam.css';
import Toast from './Toast';
import { ChevronRight, ChevronLeft, Check, User, Users, LayoutList, FileText, Send } from 'lucide-react';

const CACHE_KEY = 'createFamFormData';

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

interface CreateFamFormProps {
  onBack?: () => void;
  onSubmitSuccess?: () => void;
}
interface Person { fullName: string; nationalId?: string; mobile?: string; studentId?: string; }
interface Committee { name: string; secretary: Person; assistant: Person; plan?: string; executionDate?: string; fundingSources?: string; selectedDeptId?: string; }
interface Department { dept_id: number; name: string; }
interface FormErrors { [key: string]: string; }
interface ToastNotification { id: number; message: string; type: 'success' | 'error' | 'info' | 'warning'; }

const defaultPerson: Person = { fullName: '', nationalId: '', mobile: '', studentId: '' };

const STEPS = [
  { id: 0, label: 'بيانات الأسرة',    icon: FileText },
  { id: 1, label: 'مجلس الإدارة',     icon: User     },
  { id: 2, label: 'اللجان',           icon: Users    },
  { id: 3, label: 'مراجعة وإرسال',    icon: Send     },
];

const defaultCommittees = {
  cultural: { name: 'اللجنة الثقافية',              secretary: {...defaultPerson}, assistant: {...defaultPerson}, plan:'', executionDate:'', fundingSources:'', selectedDeptId:'' },
  wall:     { name: 'لجنة صحف الحائط',              secretary: {...defaultPerson}, assistant: {...defaultPerson}, plan:'', executionDate:'', fundingSources:'', selectedDeptId:'' },
  social:   { name: 'اللجنة الاجتماعية والرحلات',  secretary: {...defaultPerson}, assistant: {...defaultPerson}, plan:'', executionDate:'', fundingSources:'', selectedDeptId:'' },
  technical:{ name: 'اللجنة الفنية',                secretary: {...defaultPerson}, assistant: {...defaultPerson}, plan:'', executionDate:'', fundingSources:'', selectedDeptId:'' },
  scientific:{ name:'اللجنة العلمية',               secretary: {...defaultPerson}, assistant: {...defaultPerson}, plan:'', executionDate:'', fundingSources:'', selectedDeptId:'' },
  service:  { name: 'لجنة الخدمة العامة والمعسكرات',secretary: {...defaultPerson}, assistant: {...defaultPerson}, plan:'', executionDate:'', fundingSources:'', selectedDeptId:'' },
  sports:   { name: 'اللجنة الرياضية',              secretary: {...defaultPerson}, assistant: {...defaultPerson}, plan:'', executionDate:'', fundingSources:'', selectedDeptId:'' },
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
  const [step, setStep]           = useState(0);
  const [familyType, setFamilyType]             = useState('');
  const [familyName, setFamilyName]             = useState('');
  const [familyGoals, setFamilyGoals]           = useState('');
  const [familyDescription, setFamilyDescription] = useState('');
  const [boardMembers, setBoardMembers]         = useState(defaultBoard);
  const [committees, setCommittees]             = useState<Record<string, Committee>>(defaultCommittees);
  const [errors, setErrors]                     = useState<FormErrors>({});
  const [studentId, setStudentId]               = useState<number|null>(null);
  const [facultyId, setFacultyId]               = useState<number|null>(null);
  const [departments, setDepartments]           = useState<Department[]>([]);
  const [isSubmitting, setIsSubmitting]         = useState(false);
  const [toasts, setToasts]                     = useState<ToastNotification[]>([]);

  const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;

  // ── Load cached data ──────────────────────────────────────
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

  // ── Save to cache on change ───────────────────────────────
  const saveCache = useCallback(() => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        familyType, familyName, familyGoals, familyDescription, boardMembers, committees,
      }));
    } catch {}
  }, [familyType, familyName, familyGoals, familyDescription, boardMembers, committees]);

  useEffect(() => { saveCache(); }, [saveCache]);

  // ── Toast helpers ─────────────────────────────────────────
  const showToast = (message: string, type: ToastNotification['type']) => {
    setToasts(prev => [...prev, { id: Date.now(), message, type }]);
  };
  const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  // ── Fetch deps & profile ──────────────────────────────────
  useEffect(() => {
    if (!token) return;
    fetch('http://127.0.0.1:8000/api/family/departments/', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (!data) return; const d = Array.isArray(data) ? data : data.departments ?? data.results ?? []; setDepartments(d); })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const decoded = decodeToken(token);
    fetch("http://127.0.0.1:8000/api/auth/profile/", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        setStudentId(data.student_id);
        const fid = (data.faculty && data.faculty !== 0) ? data.faculty : decoded?.faculty_id ?? null;
        if (fid) setFacultyId(fid);
      }).catch(() => {});
  }, [token]);

  // ── Per-step validation ───────────────────────────────────
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
        else if (m.fullName.trim().length < 3) e[`board_${key}_fullName`] = 'الاسم 3 أحرف على الأقل';
        if (!m.nationalId) e[`board_${key}_nationalId`] = 'الرقم القومي مطلوب';
        else if (m.nationalId.length !== 14 || !/^\d+$/.test(m.nationalId)) e[`board_${key}_nationalId`] = 'الرقم القومي 14 رقماً';
        if (!m.mobile) e[`board_${key}_mobile`] = 'رقم الموبايل مطلوب';
        else if (!/^01[0-2,5]{1}[0-9]{8}$/.test(m.mobile)) e[`board_${key}_mobile`] = 'رقم الموبايل غير صحيح';
      });
    }
    return e;
  };

  const goNext = () => {
    const e = validateStep(step);
    if (Object.keys(e).length) { setErrors(e); showToast('يرجى تصحيح الأخطاء قبل المتابعة', 'error'); return; }
    setErrors({});
    setStep(s => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goPrev = () => {
    setErrors({});
    setStep(s => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Board / Committee change helpers ──────────────────────
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

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (!token) { showToast('يرجى تسجيل الدخول أولاً', 'error'); return; }

      const committeesData = Object.entries(committees).map(([key, c]) => {
        const deptId = c.selectedDeptId ? parseInt(c.selectedDeptId) : (facultyId || 0);
        const activities: any[] = [];
        if (c.plan || c.executionDate || c.fundingSources) {
          activities.push({
            title: `نشاط ${c.name}`, description: c.plan || '',
            st_date: c.executionDate || new Date().toISOString().split('T')[0],
            end_date: c.executionDate || new Date().toISOString().split('T')[0],
            location: '', cost: c.fundingSources || '0',
          });
        }
        return { committee_key: committeeKeys[key] || key,
          head:      { uid: parseInt(c.secretary.studentId||'0'), dept_id: deptId },
          assistant: { uid: parseInt(c.assistant.studentId||'0'), dept_id: deptId },
          activities };
      });

      const payload = {
        family_type: familyType, name: familyName, description: familyDescription,
        min_limit: 15, faculty_id: facultyId || 0,
        default_roles: {
          رائد:       { name: boardMembers.leader.fullName,      nid: parseInt(boardMembers.leader.nationalId||'0'),      ph_no: parseInt(boardMembers.leader.mobile||'0') },
          نائب_رائد:  { name: boardMembers.viceLeader.fullName,  nid: parseInt(boardMembers.viceLeader.nationalId||'0'),  ph_no: parseInt(boardMembers.viceLeader.mobile||'0') },
          مسؤول:      { name: boardMembers.responsible.fullName, nid: parseInt(boardMembers.responsible.nationalId||'0'), ph_no: parseInt(boardMembers.responsible.mobile||'0') },
          أمين_صندوق: { name: boardMembers.treasurer.fullName,   nid: parseInt(boardMembers.treasurer.nationalId||'0'),   ph_no: parseInt(boardMembers.treasurer.mobile||'0') },
          أخ_أكبر:    { uid: parseInt(boardMembers.elderBrother.studentId||'0') },
          أخت_كبرى:   { uid: parseInt(boardMembers.elderSister.studentId||'0') },
          أمين_سر:    { uid: parseInt(boardMembers.secretary.studentId||'0') },
          عضو_منتخب_1:{ uid: parseInt(boardMembers.elected1.studentId||'0') },
          عضو_منتخب_2:{ uid: parseInt(boardMembers.elected2.studentId||'0') },
        },
        committees: committeesData,
      };

      const res = await fetch('http://127.0.0.1:8000/api/family/student/create/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        localStorage.removeItem(CACHE_KEY);
        showToast('تم إرسال طلبك بنجاح! 🎉 يرجى انتظار مراجعته', 'success');
        setTimeout(() => { if (onSubmitSuccess) onSubmitSuccess(); }, 2000);
      } else {
        const err = await res.json().catch(() => ({}));
        const msg = err?.errors?.non_field_errors?.[0] || err?.detail || err?.error || 'فشل إرسال الطلب';
        showToast(msg, 'error');
      }
    } catch { showToast('فشل الاتصال بالخادم', 'error'); }
    finally { setIsSubmitting(false); }
  };

  // ── Render helpers ────────────────────────────────────────
  const field = (
    label: string, value: string, onChange: (v: string) => void,
    opts: { placeholder?: string; type?: string; maxLength?: number; required?: boolean; error?: string; tag?: 'textarea' | 'select'; rows?: number; children?: React.ReactNode }
  ) => (
    <div className="cf-field">
      <label className="cf-label">{label}{opts.required && <span className="cf-req">*</span>}</label>
      {opts.tag === 'textarea' ? (
        <textarea className={`cf-input cf-textarea${opts.error ? ' cf-error' : ''}`}
          value={value} onChange={e => onChange(e.target.value)}
          placeholder={opts.placeholder} rows={opts.rows || 3} />
      ) : opts.tag === 'select' ? (
        <select className={`cf-input cf-select${opts.error ? ' cf-error' : ''}`}
          value={value} onChange={e => onChange(e.target.value)}>
          {opts.children}
        </select>
      ) : (
        <input className={`cf-input${opts.error ? ' cf-error' : ''}`}
          type={opts.type || 'text'} value={value} onChange={e => onChange(e.target.value)}
          placeholder={opts.placeholder} maxLength={opts.maxLength} />
      )}
      {opts.error && <p className="cf-err-msg">⚠ {opts.error}</p>}
    </div>
  );

  // ══════════════════════════════════════════════════════════
  // STEP CONTENT
  // ══════════════════════════════════════════════════════════
  const Step0 = () => (
    <div className="cf-step-content">
      <h2 className="cf-step-title">بيانات الأسرة الأساسية</h2>
      <div className="cf-grid-2">
        {field('نوع الأسرة', familyType, setFamilyType, {
          required: true, error: errors.familyType, tag: 'select',
          children: <>
            <option value="">اختر نوع الأسرة</option>
            <option value="نوعية">نوعية</option>
            <option value="مركزية">مركزية</option>
          </>
        })}
        {field('اسم الأسرة', familyName, setFamilyName, { required: true, placeholder: 'أدخل اسم الأسرة', error: errors.familyName })}
      </div>
      {field('أهداف الأسرة', familyGoals, setFamilyGoals, { placeholder: 'اذكر أهداف الأسرة', tag: 'textarea', rows: 3 })}
      {field('وصف الأسرة', familyDescription, setFamilyDescription, { required: true, placeholder: 'قدم وصفاً تفصيلياً للأسرة ونشاطاتها', tag: 'textarea', rows: 4, error: errors.familyDescription })}
    </div>
  );

  const Step1 = () => (
    <div className="cf-step-content">
      <h2 className="cf-step-title">مجلس إدارة الأسرة</h2>
      <div className="cf-members-grid">
        {Object.entries(boardMembers).map(([key, person]) => {
          const full = requiresFullInfo.includes(key);
          return (
            <div key={key} className={`cf-member-card ${full ? 'cf-member-full' : ''}`}>
              <div className="cf-member-header">
                <User size={15} />
                <span>{boardLabels[key]}</span>
              </div>
              {full ? (
                <div className="cf-member-fields">
                  <div className="cf-field">
                    <label className="cf-label">الاسم الكامل <span className="cf-req">*</span></label>
                    <input className={`cf-input${errors[`board_${key}_fullName`] ? ' cf-error' : ''}`}
                      placeholder="الاسم الكامل" value={person.fullName}
                      onChange={e => handleBoardChange(key as any, 'fullName', e.target.value)} />
                    {errors[`board_${key}_fullName`] && <p className="cf-err-msg">⚠ {errors[`board_${key}_fullName`]}</p>}
                  </div>
                  <div className="cf-field">
                    <label className="cf-label">الرقم القومي <span className="cf-req">*</span></label>
                    <input className={`cf-input${errors[`board_${key}_nationalId`] ? ' cf-error' : ''}`}
                      placeholder="14 رقماً" maxLength={14} value={person.nationalId||''}
                      onChange={e => handleBoardChange(key as any, 'nationalId', e.target.value.replace(/\D/g,''))} />
                    {errors[`board_${key}_nationalId`] && <p className="cf-err-msg">⚠ {errors[`board_${key}_nationalId`]}</p>}
                  </div>
                  <div className="cf-field">
                    <label className="cf-label">رقم الموبايل <span className="cf-req">*</span></label>
                    <input className={`cf-input${errors[`board_${key}_mobile`] ? ' cf-error' : ''}`}
                      placeholder="01XXXXXXXXX" maxLength={11} value={person.mobile||''}
                      onChange={e => handleBoardChange(key as any, 'mobile', e.target.value.replace(/\D/g,''))} />
                    {errors[`board_${key}_mobile`] && <p className="cf-err-msg">⚠ {errors[`board_${key}_mobile`]}</p>}
                  </div>
                </div>
              ) : (
                <div className="cf-field">
                  <label className="cf-label">كود الطالب</label>
                  <input className="cf-input" placeholder="أدخل كود الطالب"
                    value={person.studentId||''}
                    onChange={e => handleBoardChange(key as any, 'studentId', e.target.value)} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const Step2 = () => (
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
                  <label className="cf-label">القسم المسؤول</label>
                  <select className="cf-input cf-select"
                    value={c.selectedDeptId||''} onChange={e => handleCommitteeFieldChange(key, 'selectedDeptId', e.target.value)}>
                    <option value="">اختر القسم</option>
                    {departments.map(d => <option key={d.dept_id} value={d.dept_id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="cf-field">
                  <label className="cf-label">موعد التنفيذ <span className="cf-optional">(اختياري)</span></label>
                  <input type="date" className="cf-input" value={c.executionDate||''}
                    onChange={e => handleCommitteeFieldChange(key, 'executionDate', e.target.value)} />
                </div>
              </div>
              <div className="cf-grid-2">
                <div className="cf-field">
                  <label className="cf-label">كود أمين اللجنة</label>
                  <input className="cf-input" placeholder="كود الطالب"
                    value={c.secretary.studentId||''}
                    onChange={e => handleCommitteeChange(key, 'secretary', 'studentId', e.target.value)} />
                </div>
                <div className="cf-field">
                  <label className="cf-label">كود أمين مساعد اللجنة</label>
                  <input className="cf-input" placeholder="كود الطالب"
                    value={c.assistant.studentId||''}
                    onChange={e => handleCommitteeChange(key, 'assistant', 'studentId', e.target.value)} />
                </div>
              </div>
              <div className="cf-field">
                <label className="cf-label">الخطة <span className="cf-optional">(اختياري)</span></label>
                <textarea className="cf-input cf-textarea" placeholder="أدخل خطة اللجنة" rows={2}
                  value={c.plan||''} onChange={e => handleCommitteeFieldChange(key, 'plan', e.target.value)} />
              </div>
              <div className="cf-field">
                <label className="cf-label">مصادر التمويل <span className="cf-optional">(اختياري)</span></label>
                <input className="cf-input" placeholder="مصادر التمويل"
                  value={c.fundingSources||''} onChange={e => handleCommitteeFieldChange(key, 'fundingSources', e.target.value)} />
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );

  const Step3 = () => (
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

  const stepComponents = [<Step0 />, <Step1 />, <Step2 />, <Step3 />];

  return (
    <div className="cf-page">
      <div className="toast-container">
        {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />)}
      </div>

      {/* ── Wizard Shell ── */}
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

          {/* Step indicators */}
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

          {/* Progress bar */}
          <div className="cf-progress-bar">
            <div className="cf-progress-fill" style={{ width: `${((step) / (STEPS.length - 1)) * 100}%` }} />
          </div>
        </div>

        {/* Step Body */}
        <div className="cf-body">
          {stepComponents[step]}
        </div>

        {/* Navigation Footer */}
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