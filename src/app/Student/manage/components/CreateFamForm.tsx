"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../styles/CreateFam.css';
import Toast from './Toast';
import { ChevronRight, ChevronLeft, Check, User, Users, FileText, Send } from 'lucide-react';
import { authFetch, getBaseUrl } from "@/utils/globalFetch";

const CACHE_KEY = 'createFamFormData';

/* ─── Token decode ─── */
const decodeToken = (token: string) => {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(atob(b64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
  } catch { return null; }
};

/* ─── Arabic error map ─── */
const AR_CODES: Record<string, string> = {
  invalid:           'قيمة غير صالحة',
  unique:            'هذه القيمة مستخدمة بالفعل',
  required:          'هذا الحقل مطلوب',
  null:              'لا يمكن أن يكون هذا الحقل فارغاً',
  blank:             'لا يمكن أن يكون هذا الحقل فارغاً',
  does_not_exist:    'لم يتم العثور على هذا الطالب',
  not_found:         'لم يتم العثور على السجل',
  permission_denied: 'غير مصرح بهذه العملية',
  already_exists:    'هذا السجل موجود بالفعل',
  throttled:         'الرجاء الانتظار قبل المحاولة مرة أخرى',
  max_length:        'القيمة أطول من الحد المسموح',
  min_length:        'القيمة أقصر من الحد المسموح',
  invalid_choice:    'اختيار غير صالح',
  max_value:         'القيمة أكبر من الحد المسموح',
  min_value:         'القيمة أصغر من الحد المسموح',
};

const FIELD_AR: Record<string, string> = {
  'أخ_أكبر': 'الأخ الأكبر', 'أخت_كبرى': 'الأخت الكبرى',
  'أمين_سر': 'أمين السر', 'عضو_منتخب_1': 'العضو المنتخب الأول',
  'عضو_منتخب_2': 'العضو المنتخب الثاني', 'رائد': 'رائد الأسرة',
  'نائب_رائد': 'نائب الرائد', 'مسؤول': 'مسئول الأسرة', 'أمين_صندوق': 'أمين الصندوق',
  cultural: 'اللجنة الثقافية', newspaper: 'لجنة صحف الحائط',
  social: 'اللجنة الاجتماعية والرحلات', arts: 'اللجنة الفنية',
  scientific: 'اللجنة العلمية', service: 'لجنة الخدمة العامة والمعسكرات',
  sports: 'اللجنة الرياضية',
  name: 'اسم الأسرة', description: 'وصف الأسرة',
  family_type: 'نوع الأسرة', faculty_id: 'الكلية',
  uid: 'كود الطالب', nid: 'الرقم القومي', ph_no: 'رقم الهاتف',
  non_field_errors: '',
};

function parseApiErrors(err: unknown): string[] {
  if (!err || typeof err !== 'object') return ['\u062d\u062f\u062b \u062e\u0637\u0623 \u063a\u064a\u0631 \u0645\u062a\u0648\u0642\u0639'];
  const msgs: string[] = [];

  const resolveString = (raw: string, parentKey = ''): string => {
    const strM  = raw.match(/string='([^']+)'/);
    const codeM = raw.match(/code='([^']+)'/);
    const clean = strM ? strM[1] : raw;
    const code  = codeM?.[1];
    const disp  = (code && AR_CODES[code]) ? AR_CODES[code]
                : AR_CODES[clean]          ? AR_CODES[clean]
                : clean;
    const label = FIELD_AR[parentKey] ?? (parentKey || '');
    return label ? `${label}: ${disp}` : disp;
  };

  const extract = (obj: unknown, parentKey = ''): void => {
    if (typeof obj === 'string') {
      msgs.push(resolveString(obj, parentKey));
      return;
    }
    if (Array.isArray(obj)) { obj.forEach(i => extract(i, parentKey)); return; }
    if (typeof obj === 'object' && obj !== null) {
      const o = obj as Record<string, unknown>;
      if ('error' in o && Object.keys(o).length === 1) {
        extract(o.error, '');
        return;
      }
      Object.entries(o).forEach(([k, v]) => {
        if (['status', 'status_code'].includes(k)) return;
        extract(v, k);
      });
    }
  };

  extract(err);
  return [...new Set(msgs)].filter(Boolean);
}

/* ─── Types ─── */
interface CreateFamFormProps { onBack?: () => void; onSubmitSuccess?: () => void; }
interface Person { fullName: string; nationalId?: string; mobile?: string; studentId?: string; }
interface Activity {
  title: string; description: string; st_date: string;
  end_date?: string; location?: string; cost?: string;
}
interface Committee {
  name: string; secretary: Person; assistant: Person;
  activities: Activity[]; selectedDeptId?: string;
}
interface Department { dept_id: number; name: string; }
interface FormErrors { [key: string]: string; }
interface ToastNotification { id: number; message: string; type: 'success' | 'error' | 'info' | 'warning'; }

/* ─── UID format validation (no DB lookup) ─── */
/**
 * Returns an error string if the UID is invalid, or '' if it's fine.
 * Rules: required, digits only, between 4 and 14 characters.
 */
function validateUidFormat(uid: string, label: string): string {
  const trimmed = uid?.trim() ?? '';
  if (!trimmed) return `كود الطالب لـ ${label} مطلوب`;
  if (!/^\d+$/.test(trimmed)) return 'أرقام فقط';
  return '';
}

/* ─── UidInput component (format-only, no live lookup) ─── */
interface UidInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  duplicateOf?: string;
}

function UidInput({ id, label, value, onChange, error, duplicateOf }: UidInputProps) {
  const isDuplicate = Boolean(duplicateOf);

  // Local format feedback (shown while typing, before submit)
  const localWarn = '';

  const handleChange = (v: string) => {
    onChange(v.replace(/\D/g, ''));
  };

  const inputClass = [
    'cf-input',
    error || isDuplicate ? 'cf-input--error' : '',
    !error && !isDuplicate && value.length > 0 ? 'cf-input--success' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="cf-field">
      <label className="cf-label">{label}</label>
      <div className="cf-input-wrap">
        <input
          id={id}
          className={inputClass}
          placeholder="أدخل كود الطالب"
          value={value}
          inputMode="numeric"
          maxLength={14}
          onChange={e => handleChange(e.target.value)}
        />
        {!error && !isDuplicate && value.length > 0 && (
          <span className="cf-input-suffix">
            <span style={{ color: 'var(--success)', fontSize: 16 }}>✓</span>
          </span>
        )}
      </div>

      {/* Priority: duplicate > submit error > local typing hint */}
      {isDuplicate && (
        <div className="cf-feedback cf-feedback--error">
          <span className="cf-feedback-icon">✕</span>
          <span>هذا الكود مستخدم بالفعل لـ «{duplicateOf}» — لا يمكن تكرار الطالب في أدوار مختلفة</span>
        </div>
      )}
      {!isDuplicate && error && (
        <div className="cf-feedback cf-feedback--error">
          <span className="cf-feedback-icon">✕</span>
          <span>{error}</span>
        </div>
      )}
      {!isDuplicate && !error && localWarn && (
        <div className="cf-feedback cf-feedback--info">
          <span className="cf-feedback-icon">ℹ</span>
          <span>{localWarn}</span>
        </div>
      )}
    </div>
  );
}

/* ─── Feedback pill ─── */
function Feedback({ type, children }: { type: 'error' | 'warn' | 'success' | 'info'; children: React.ReactNode }) {
  const icons = { error: '✕', warn: '⚠', success: '✓', info: 'ℹ' };
  return (
    <div className={`cf-feedback cf-feedback--${type}`}>
      <span className="cf-feedback-icon">{icons[type]}</span>
      <span>{children}</span>
    </div>
  );
}

/* ─── Defaults ─── */
const defaultPerson: Person = { fullName: '', nationalId: '', mobile: '', studentId: '' };
const defaultActivity: Activity = { title: '', description: '', st_date: '', end_date: '', location: '', cost: '' };

const STEPS = [
  { id: 0, label: 'بيانات الأسرة',  icon: FileText },
  { id: 1, label: 'مجلس الإدارة',   icon: User     },
  { id: 2, label: 'اللجان',         icon: Users    },
  { id: 3, label: 'مراجعة وإرسال',  icon: Send     },
];

const defaultCommittees = {
  cultural:   { name: 'اللجنة الثقافية',               secretary: {...defaultPerson}, assistant: {...defaultPerson}, activities: [{...defaultActivity}], selectedDeptId: '' },
  wall:       { name: 'لجنة صحف الحائط',               secretary: {...defaultPerson}, assistant: {...defaultPerson}, activities: [{...defaultActivity}], selectedDeptId: '' },
  social:     { name: 'اللجنة الاجتماعية والرحلات',    secretary: {...defaultPerson}, assistant: {...defaultPerson}, activities: [{...defaultActivity}], selectedDeptId: '' },
  technical:  { name: 'اللجنة الفنية',                 secretary: {...defaultPerson}, assistant: {...defaultPerson}, activities: [{...defaultActivity}], selectedDeptId: '' },
  scientific: { name: 'اللجنة العلمية',                secretary: {...defaultPerson}, assistant: {...defaultPerson}, activities: [{...defaultActivity}], selectedDeptId: '' },
  service:    { name: 'لجنة الخدمة العامة والمعسكرات', secretary: {...defaultPerson}, assistant: {...defaultPerson}, activities: [{...defaultActivity}], selectedDeptId: '' },
  sports:     { name: 'اللجنة الرياضية',               secretary: {...defaultPerson}, assistant: {...defaultPerson}, activities: [{...defaultActivity}], selectedDeptId: '' },
};

const defaultBoard = {
  leader:       {...defaultPerson}, viceLeader:   {...defaultPerson},
  responsible:  {...defaultPerson}, treasurer:    {...defaultPerson},
  elderBrother: {...defaultPerson}, elderSister:  {...defaultPerson},
  secretary:    {...defaultPerson}, elected1:     {...defaultPerson}, elected2: {...defaultPerson},
};

const boardLabels: Record<string, string> = {
  leader: 'رائد الأسرة', viceLeader: 'نائب الرائد', responsible: 'مسئول الأسرة',
  treasurer: 'أمين الصندوق', elderBrother: 'الأخ الأكبر', elderSister: 'الأخت الكبرى',
  secretary: 'السكرتير / أمين السر', elected1: 'عضو منتخب (1)', elected2: 'عضو منتخب (2)',
};

const committeeKeys: Record<string, string> = {
  cultural: 'cultural', wall: 'newspaper', social: 'social', technical: 'arts',
  scientific: 'scientific', service: 'service', sports: 'sports',
};

const requiresFullInfo = ['leader', 'viceLeader', 'responsible', 'treasurer'];
const requiresUidOnly  = ['elderBrother', 'elderSister', 'secretary', 'elected1', 'elected2'];

/* ─── Duplicate UID map ─── */
function buildDuplicateMap(
  boardMembers: typeof defaultBoard,
  committees: Record<string, Committee>
): Record<string, string> {
  const seen: Record<string, string> = {};
  const dupes: Record<string, string> = {};

  const register = (uid: string, inputId: string, label: string) => {
    const trimmed = uid?.trim();
    if (!trimmed) return;
    if (seen[trimmed]) {
      dupes[inputId] = seen[trimmed];
    } else {
      seen[trimmed] = label;
    }
  };

  requiresUidOnly.forEach(key => {
    const m = boardMembers[key as keyof typeof boardMembers];
    register(m.studentId || '', `board_${key}`, boardLabels[key]);
  });

  Object.entries(committees).forEach(([ck, c]) => {
    register(c.secretary.studentId || '', `comm_${ck}_sec`, `${c.name} (أمين)`);
    register(c.assistant.studentId || '', `comm_${ck}_ast`, `${c.name} (مساعد)`);
  });

  return dupes;
}

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
const CreateFamForm: React.FC<CreateFamFormProps> = ({ onBack, onSubmitSuccess }) => {
  const [step, setStep]                           = useState(0);
  const [familyType, setFamilyType]               = useState('');
  const [familyName, setFamilyName]               = useState('');
  const [familyGoals, setFamilyGoals]             = useState('');
  const [familyDescription, setFamilyDescription] = useState('');
  const [boardMembers, setBoardMembers]           = useState(defaultBoard);
  const [committees, setCommittees]               = useState<Record<string, Committee>>(defaultCommittees);
  const [errors, setErrors]                       = useState<FormErrors>({});
  const [facultyId, setFacultyId]                 = useState<number | null>(null);
  const [departments, setDepartments]             = useState<Department[]>([]);
  const [isSubmitting, setIsSubmitting]           = useState(false);
  const [toasts, setToasts]                       = useState<ToastNotification[]>([]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null;
  const dupeMap = buildDuplicateMap(boardMembers, committees);

  /* ── Activity helpers ── */
  const handleActivityChange = (ck: string, ai: number, field: keyof Activity, value: string) => {
    setCommittees(prev => {
      const u = { ...prev };
      u[ck].activities[ai][field] = value;
      return u;
    });
  };

  const addActivity = (ck: string) =>
    setCommittees(prev => ({ ...prev, [ck]: { ...prev[ck], activities: [...prev[ck].activities, { ...defaultActivity }] } }));

  const removeActivity = (ck: string, ai: number) =>
    setCommittees(prev => ({ ...prev, [ck]: { ...prev[ck], activities: prev[ck].activities.filter((_, i) => i !== ai) } }));

  /* ── Cache ── */
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      if (d.familyType)        setFamilyType(d.familyType);
      if (d.familyName)        setFamilyName(d.familyName);
      if (d.familyGoals)       setFamilyGoals(d.familyGoals);
      if (d.familyDescription) setFamilyDescription(d.familyDescription);
      if (d.boardMembers)      setBoardMembers(d.boardMembers);
      if (d.committees)        setCommittees(d.committees);
    } catch {}
  }, []);

  const saveCache = useCallback(() => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ familyType, familyName, familyGoals, familyDescription, boardMembers, committees }));
    } catch {}
  }, [familyType, familyName, familyGoals, familyDescription, boardMembers, committees]);
  useEffect(() => { saveCache(); }, [saveCache]);

  /* ── Toast ── */
  const showToast = (message: string, type: ToastNotification['type']) =>
    setToasts(p => [...p, { id: Date.now(), message, type }]);
  const removeToast = (id: number) => setToasts(p => p.filter(t => t.id !== id));

  /* ── Fetch departments & faculty ── */
  useEffect(() => {
    if (!token) return;
    authFetch(`${getBaseUrl()}/api/family/departments/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        setDepartments(Array.isArray(data) ? data : data.departments ?? data.results ?? []);
      }).catch(() => {});
  }, [token]);

useEffect(() => {
  if (!token) return;

  const decoded = decodeToken(token);

  authFetch(`${getBaseUrl()}/api/auth/profile/`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      console.log('profile data:', data);
      console.log('decoded token:', decoded);

      if (!data) return;

      const fid = (data.faculty && data.faculty !== 0)
        ? data.faculty
        : decoded?.faculty_id ?? null;

      console.log('resolved facultyId:', fid);

      if (fid) setFacultyId(fid);
    })
    .catch(() => {});
}, [token]);

  /* ════════════════════════════════════════════
     VALIDATION — per step
  ════════════════════════════════════════════ */
  const validateStep = (s: number): FormErrors => {
    const e: FormErrors = {};

    if (s === 0) {
      if (!familyType)
        e.familyType = 'يرجى اختيار نوع الأسرة';
      if (!familyName.trim())
        e.familyName = 'يرجى إدخال اسم الأسرة';
      else if (familyName.trim().length < 3)
        e.familyName = 'اسم الأسرة يجب أن يكون 3 أحرف على الأقل';
      if (!familyDescription.trim())
        e.familyDescription = 'يرجى إدخال وصف الأسرة';
      else if (familyDescription.trim().length < 10)
        e.familyDescription = 'الوصف يجب أن يكون 10 أحرف على الأقل';
    }

    if (s === 1) {
      requiresFullInfo.forEach(key => {
        const m = boardMembers[key as keyof typeof boardMembers];
        if (!m.fullName.trim())
          e[`board_${key}_fullName`] = 'الاسم الكامل مطلوب';
        else if (m.fullName.trim().length < 3)
          e[`board_${key}_fullName`] = 'الاسم يجب أن يكون 3 أحرف على الأقل';

        if (!m.nationalId)
          e[`board_${key}_nationalId`] = 'الرقم القومي مطلوب';
        else if (m.nationalId.length !== 14 || !/^\d+$/.test(m.nationalId))
          e[`board_${key}_nationalId`] = 'يجب أن يكون 14 رقماً بالضبط';

        if (!m.mobile)
          e[`board_${key}_mobile`] = 'رقم الهاتف مطلوب';
        else if (!/^01[0-2,5][0-9]{8}$/.test(m.mobile))
          e[`board_${key}_mobile`] = 'صيغة غير صحيحة — مثال: 01XXXXXXXXX';
      });

      // UID-only roles — format validation only
      requiresUidOnly.forEach(key => {
        const uid = boardMembers[key as keyof typeof boardMembers].studentId || '';
        const err = validateUidFormat(uid, boardLabels[key]);
        if (err) e[`board_${key}_studentId`] = err;
      });

      // Duplicate check across board UID-only roles
      const seenUids: Record<string, string> = {};
      requiresUidOnly.forEach(key => {
        const uid = boardMembers[key as keyof typeof boardMembers].studentId?.trim() || '';
        if (!uid) return;
        const errKey = `board_${key}_studentId`;
        if (seenUids[uid]) {
          e[errKey] = `هذا الكود مستخدم بالفعل لـ «${boardLabels[seenUids[uid]]}»`;
        } else {
          seenUids[uid] = key;
        }
      });
    }

    if (s === 2) {
      Object.entries(committees).forEach(([ck, c]) => {
        // Secretary
        const secErr = validateUidFormat(c.secretary.studentId || '', `أمين ${c.name}`);
        if (secErr) e[`comm_${ck}_sec_studentId`] = secErr;

        // Assistant
        const astErr = validateUidFormat(c.assistant.studentId || '', `مساعد ${c.name}`);
        if (astErr) e[`comm_${ck}_ast_studentId`] = astErr;

        // Secretary ≠ Assistant
        if (
          !secErr && !astErr &&
          c.secretary.studentId?.trim() === c.assistant.studentId?.trim()
        ) {
          e[`comm_${ck}_ast_studentId`] =
            `لا يمكن أن يكون الأمين والمساعد نفس الطالب في ${c.name}`;
        }


      });

      // Cross-committee + cross-board duplicate UID check
      const seenUids: Record<string, string> = {};
      requiresUidOnly.forEach(key => {
        const uid = boardMembers[key as keyof typeof boardMembers].studentId?.trim() || '';
        if (uid) seenUids[uid] = boardLabels[key];
      });

      Object.entries(committees).forEach(([ck, c]) => {
        const secUid = c.secretary.studentId?.trim() || '';
        const astUid = c.assistant.studentId?.trim() || '';

        if (secUid) {
          if (seenUids[secUid] && !e[`comm_${ck}_sec_studentId`]) {
            e[`comm_${ck}_sec_studentId`] = `هذا الكود مستخدم بالفعل لـ «${seenUids[secUid]}»`;
          } else if (!seenUids[secUid]) {
            seenUids[secUid] = `${c.name} (أمين)`;
          }
        }

        if (astUid) {
          if (seenUids[astUid] && !e[`comm_${ck}_ast_studentId`]) {
            e[`comm_${ck}_ast_studentId`] = `هذا الكود مستخدم بالفعل لـ «${seenUids[astUid]}»`;
          } else if (!seenUids[astUid]) {
            seenUids[astUid] = `${c.name} (مساعد)`;
          }
        }
      });
    }

    return e;
  };

  /* ── Navigation ── */
  const goNext = () => {
    const e = validateStep(step);
    if (Object.keys(e).length) {
      setErrors(e);
      showToast(`يوجد ${Object.keys(e).length} خطأ في البيانات — يرجى المراجعة`, 'error');
      setTimeout(() => document.querySelector('.cf-feedback--error')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
      return;
    }
    setErrors({});
    setStep(s => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goPrev = () => { setErrors({}); setStep(s => Math.max(s - 1, 0)); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  /* ── Field handlers ── */
  const handleBoardChange = (key: keyof typeof boardMembers, field: string, value: string) => {
    setBoardMembers(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
    setErrors(prev => { const n = { ...prev }; delete n[`board_${key}_${field}`]; return n; });
  };

  const handleCommitteeChange = (ck: string, role: 'secretary' | 'assistant', field: keyof Person, value: string) =>
    setCommittees(prev => ({ ...prev, [ck]: { ...prev[ck], [role]: { ...prev[ck][role], [field]: value } } }));

  const handleCommitteeFieldChange = (ck: string, field: string, value: string) =>
    setCommittees(prev => ({ ...prev, [ck]: { ...prev[ck], [field]: value } }));

  /* ── Submit ── */
  const handleSubmit = async () => {
    const allErrors: FormErrors = {
      ...validateStep(0),
      ...validateStep(1),
      ...validateStep(2),
    };
    if (Object.keys(allErrors).length) {
      setErrors(allErrors);
      showToast(`يوجد ${Object.keys(allErrors).length} خطأ — يرجى مراجعة جميع الخطوات`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!token) { showToast('يرجى تسجيل الدخول أولاً', 'error'); return; }

      const committeesData = Object.entries(committees).map(([key, c]) => {
        const deptId = c.selectedDeptId ? parseInt(c.selectedDeptId) : (facultyId || 0);
        const activities = c.activities
          .filter(a => a.title.trim() && a.st_date)
          .map(a => ({
            title: a.title.trim(), description: a.description || '',
            st_date: a.st_date, end_date: a.end_date || a.st_date,
            location: a.location || '', cost: a.cost || '0',
          }));
        return {
          committee_key: committeeKeys[key] || key,
          head:      { uid: parseInt(c.secretary.studentId || '0'), dept_id: deptId },
          assistant: { uid: parseInt(c.assistant.studentId || '0'), dept_id: deptId },
          activities,
        };
      });

      const payload = {
        family_type: familyType, name: familyName, description: familyDescription,
        min_limit: 15, faculty_id: facultyId || 0,
        default_roles: {
          رائد:        { name: boardMembers.leader.fullName,      nid: parseInt(boardMembers.leader.nationalId || '0'),      ph_no: parseInt(boardMembers.leader.mobile || '0') },
          نائب_رائد:   { name: boardMembers.viceLeader.fullName,  nid: parseInt(boardMembers.viceLeader.nationalId || '0'),  ph_no: parseInt(boardMembers.viceLeader.mobile || '0') },
          مسؤول:       { name: boardMembers.responsible.fullName, nid: parseInt(boardMembers.responsible.nationalId || '0'), ph_no: parseInt(boardMembers.responsible.mobile || '0') },
          أمين_صندوق:  { name: boardMembers.treasurer.fullName,   nid: parseInt(boardMembers.treasurer.nationalId || '0'),   ph_no: parseInt(boardMembers.treasurer.mobile || '0') },
          أخ_أكبر:     { uid: parseInt(boardMembers.elderBrother.studentId || '0') },
          أخت_كبرى:    { uid: parseInt(boardMembers.elderSister.studentId || '0') },
          أمين_سر:     { uid: parseInt(boardMembers.secretary.studentId || '0') },
          عضو_منتخب_1: { uid: parseInt(boardMembers.elected1.studentId || '0') },
          عضو_منتخب_2: { uid: parseInt(boardMembers.elected2.studentId || '0') },
        },
        committees: committeesData,
      };

      const res = await authFetch(`${getBaseUrl()}/api/family/student/create/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        localStorage.removeItem(CACHE_KEY);
        showToast('تم إرسال طلبك بنجاح 🎉 — يرجى انتظار المراجعة', 'success');
        setTimeout(() => { if (onSubmitSuccess) onSubmitSuccess(); }, 2000);
      } else {
        let errData: Record<string, unknown> = {};
        try { errData = await res.json(); } catch {}
        const lines = parseApiErrors(errData);
        lines.forEach((line, i) =>
          setTimeout(() => showToast(line, 'error'), i * 550)
        );
      }
    } catch {
      showToast('فشل الاتصال بالخادم — تحقق من الاتصال بالإنترنت', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ════════════════════════════════════════════
     STEP RENDERS
  ════════════════════════════════════════════ */

  const renderStep0 = () => (
    <div className="cf-step-content">
      <h2 className="cf-step-title">بيانات الأسرة الأساسية</h2>

      <div className="cf-grid-2">
        <div className="cf-field">
          <label className="cf-label">نوع الأسرة <span className="cf-req">*</span></label>
          <select
            className={`cf-input cf-select${errors.familyType ? ' cf-input--error' : ''}`}
            value={familyType}
            onChange={e => { setFamilyType(e.target.value); setErrors(p => { const n = { ...p }; delete n.familyType; return n; }); }}
          >
            <option value="">اختر نوع الأسرة</option>
            <option value="نوعية">نوعية</option>
            <option value="مركزية">مركزية</option>
          </select>
          {errors.familyType && <Feedback type="error">{errors.familyType}</Feedback>}
        </div>

        <div className="cf-field">
          <label className="cf-label">اسم الأسرة <span className="cf-req">*</span></label>
          <input
            className={`cf-input${errors.familyName ? ' cf-input--error' : ''}`}
            placeholder="أدخل اسم الأسرة"
            value={familyName}
            onChange={e => { setFamilyName(e.target.value); setErrors(p => { const n = { ...p }; delete n.familyName; return n; }); }}
          />
          {errors.familyName && <Feedback type="error">{errors.familyName}</Feedback>}
        </div>
      </div>

      <div className="cf-field">
        <label className="cf-label">أهداف الأسرة <span className="cf-optional">(اختياري)</span></label>
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
          className={`cf-input cf-textarea${errors.familyDescription ? ' cf-input--error' : ''}`}
          placeholder="قدم وصفاً تفصيلياً للأسرة ونشاطاتها"
          rows={4}
          value={familyDescription}
          onChange={e => { setFamilyDescription(e.target.value); setErrors(p => { const n = { ...p }; delete n.familyDescription; return n; }); }}
        />
        {errors.familyDescription && <Feedback type="error">{errors.familyDescription}</Feedback>}
        {familyDescription.length > 0 && familyDescription.length < 10 && (
          <Feedback type="info">يتطلب 10 أحرف على الأقل — لديك {familyDescription.length}</Feedback>
        )}
      </div>
    </div>
  );

  const renderStep1 = () => {
    const boardHasErrors = Object.keys(errors).some(k => k.startsWith('board_'));
    return (
      <div className="cf-step-content">
        <h2 className="cf-step-title">مجلس إدارة الأسرة</h2>

        {boardHasErrors && (
          <div className="cf-error-banner">
            <span className="cf-error-banner-icon">⚠</span>
            <div>
              <strong>يوجد خطأ في بيانات مجلس الإدارة:</strong>
              <ul className="cf-error-list">
                {Object.entries(errors)
                  .filter(([k]) => k.startsWith('board_'))
                  .slice(0, 5)
                  .map(([k, v]) => {
                    const parts = k.split('_');
                    const roleKey = parts[1];
                    return <li key={k}>{boardLabels[roleKey] ?? roleKey}: {v}</li>;
                  })}
              </ul>
            </div>
          </div>
        )}

        <div className="cf-members-grid">
          {Object.entries(boardMembers).map(([key, person]) => {
            const full   = requiresFullInfo.includes(key);
            const hasErr = Object.keys(errors).some(k => k.startsWith(`board_${key}_`));
            return (
              <div key={key} className={`cf-member-card ${full ? 'cf-member-full' : ''} ${hasErr ? 'cf-member-card-error' : ''}`}>
                <div className="cf-member-header">
                  <User size={14} />
                  <span>{boardLabels[key]}</span>
                  {hasErr && <span className="cf-member-error-badge">يوجد خطأ</span>}
                </div>

                {full ? (
                  <div className="cf-member-fields">
                    <div className="cf-field">
                      <label className="cf-label">الاسم الكامل <span className="cf-req">*</span></label>
                      <input
                        className={`cf-input${errors[`board_${key}_fullName`] ? ' cf-input--error' : ''}`}
                        placeholder="الاسم الكامل"
                        value={person.fullName}
                        onChange={e => handleBoardChange(key as keyof typeof boardMembers, 'fullName', e.target.value)}
                      />
                      {errors[`board_${key}_fullName`] && <Feedback type="error">{errors[`board_${key}_fullName`]}</Feedback>}
                    </div>

                    <div className="cf-field">
                      <label className="cf-label">الرقم القومي <span className="cf-req">*</span></label>
                      <input
                        className={`cf-input${errors[`board_${key}_nationalId`] ? ' cf-input--error' : ''}`}
                        placeholder="14 رقماً"
                        maxLength={14}
                        inputMode="numeric"
                        value={person.nationalId || ''}
                        onChange={e => handleBoardChange(key as keyof typeof boardMembers, 'nationalId', e.target.value.replace(/\D/g, ''))}
                      />
                      {errors[`board_${key}_nationalId`] && <Feedback type="error">{errors[`board_${key}_nationalId`]}</Feedback>}
                      {!errors[`board_${key}_nationalId`] && (person.nationalId?.length ?? 0) > 0 && (person.nationalId?.length ?? 0) < 14 && (
                        <Feedback type="info">{(person.nationalId?.length ?? 0)} / 14 رقم</Feedback>
                      )}
                    </div>

                    <div className="cf-field">
                      <label className="cf-label">رقم الهاتف <span className="cf-req">*</span></label>
                      <input
                        className={`cf-input${errors[`board_${key}_mobile`] ? ' cf-input--error' : ''}`}
                        placeholder="01XXXXXXXXX"
                        maxLength={11}
                        inputMode="numeric"
                        value={person.mobile || ''}
                        onChange={e => handleBoardChange(key as keyof typeof boardMembers, 'mobile', e.target.value.replace(/\D/g, ''))}
                      />
                      {errors[`board_${key}_mobile`] && <Feedback type="error">{errors[`board_${key}_mobile`]}</Feedback>}
                    </div>
                  </div>
                ) : (
                  <UidInput
                    id={`board_${key}`}
                    label="كود الطالب"
                    value={person.studentId || ''}
                    onChange={v => handleBoardChange(key as keyof typeof boardMembers, 'studentId', v)}
                    error={errors[`board_${key}_studentId`]}
                    duplicateOf={dupeMap[`board_${key}`]}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderStep2 = () => {
    const commHasErrors = Object.keys(errors).some(k => k.startsWith('comm_'));
    return (
      <div className="cf-step-content">
        <h2 className="cf-step-title">اللجان</h2>

        {commHasErrors && (
          <div className="cf-error-banner">
            <span className="cf-error-banner-icon">⚠</span>
            <div>
              <strong>يوجد خطأ في بيانات اللجان — يرجى المراجعة</strong>
              <ul className="cf-error-list">
                {Object.entries(errors)
                  .filter(([k]) => k.startsWith('comm_'))
                  .slice(0, 6)
                  .map(([k, v]) => <li key={k}>{v}</li>)}
              </ul>
            </div>
          </div>
        )}

        <div className="cf-committees-list">
          {Object.entries(committees).map(([key, c]) => {
            const secErrKey = `comm_${key}_sec_studentId`;
            const astErrKey = `comm_${key}_ast_studentId`;
            const commHasErr = Object.keys(errors).some(k => k.startsWith(`comm_${key}_`));

            return (
              <details key={key} className={`cf-committee${commHasErr ? ' cf-committee--error' : ''}`}>
                <summary className="cf-committee-summary">
                  <span className="cf-committee-dot" style={{ background: commHasErr ? 'var(--error)' : undefined }} />
                  <span>{c.name}</span>
                  {commHasErr && <span className="cf-member-error-badge" style={{ marginRight: 'auto' }}>يوجد خطأ</span>}
                  <ChevronLeft size={15} className="cf-committee-chevron" />
                </summary>
                <div className="cf-committee-body">
                  <div className="cf-grid-2">
                    <UidInput
                      id={`comm_${key}_sec`}
                      label="كود أمين اللجنة"
                      value={c.secretary.studentId || ''}
                      onChange={v => {
                        handleCommitteeChange(key, 'secretary', 'studentId', v);
                        setErrors(p => { const n = {...p}; delete n[secErrKey]; return n; });
                      }}
                      error={errors[secErrKey]}
                      duplicateOf={dupeMap[`comm_${key}_sec`]}
                    />
                    <UidInput
                      id={`comm_${key}_ast`}
                      label="كود أمين مساعد اللجنة"
                      value={c.assistant.studentId || ''}
                      onChange={v => {
                        handleCommitteeChange(key, 'assistant', 'studentId', v);
                        setErrors(p => { const n = {...p}; delete n[astErrKey]; return n; });
                      }}
                      error={errors[astErrKey]}
                      duplicateOf={dupeMap[`comm_${key}_ast`]}
                    />
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
                        <button type="button" onClick={() => removeActivity(key, ai)} className="cf-delete-btn">
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
                            onChange={e => handleActivityChange(key, ai, 'title', e.target.value)}
                          />
                        </div>
                        <div className="cf-field">
                          <label className="cf-label">تاريخ البداية</label>
                          <input
                            type="date"
                            className="cf-input"
                            value={a.st_date}
                            onChange={e => handleActivityChange(key, ai, 'st_date', e.target.value)}
                          />
                        </div>
                        <div className="cf-field">
                          <label className="cf-label">تاريخ النهاية</label>
                          <input
                            type="date"
                            className="cf-input"
                            value={a.end_date || ''}
                            onChange={e => handleActivityChange(key, ai, 'end_date', e.target.value)}
                          />
                        </div>
                        <div className="cf-field">
                          <label className="cf-label">مصادر التمويل</label>
                          <input
                            className="cf-input"
                            placeholder="مصادر التمويل"
                            value={a.description}
                            onChange={e => handleActivityChange(key, ai, 'description', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button type="button" className="cf-btn-add" onClick={() => addActivity(key)}>
                    + إضافة مشروع جديد
                  </button>
                </div>
              </details>
            );
          })}
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="cf-step-content">
      <h2 className="cf-step-title">مراجعة البيانات قبل الإرسال</h2>
      <div className="cf-review">
        <div className="cf-review-section">
          <h3 className="cf-review-heading">بيانات الأسرة</h3>
          <div className="cf-review-grid">
            <div className="cf-review-item"><span className="cf-review-key">النوع</span><span className="cf-review-val">{familyType || '—'}</span></div>
            <div className="cf-review-item"><span className="cf-review-key">الاسم</span><span className="cf-review-val">{familyName || '—'}</span></div>
            <div className="cf-review-item cf-review-full"><span className="cf-review-key">الوصف</span><span className="cf-review-val">{familyDescription || '—'}</span></div>
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
          <Check size={15} />
          تأكد من صحة جميع البيانات قبل الإرسال — لا يمكن التعديل بعد التقديم.
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

        <div className="cf-progress-header">
          <div className="cf-progress-top">
            <button className="cf-back-page" onClick={onBack}>
              <ChevronRight size={15} /> العودة للقائمة
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
                      {done ? <Check size={13} /> : <Icon size={13} />}
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

        <div className="cf-body">
          {stepRenderers[step]()}
        </div>

        <div className="cf-footer">
          <button className="cf-btn-ghost" onClick={goPrev} disabled={step === 0}>
            <ChevronRight size={15} /> السابق
          </button>

          <div className="cf-footer-dots">
            {STEPS.map((_, i) => (
              <span key={i} className={`cf-dot ${i === step ? 'cf-dot-active' : i < step ? 'cf-dot-done' : ''}`} />
            ))}
          </div>

          {step < STEPS.length - 1 ? (
            <button className="cf-btn-primary" onClick={goNext}>
              التالي <ChevronLeft size={15} />
            </button>
          ) : (
            <button className="cf-btn-submit" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'جاري الإرسال...' : <><Send size={14} /> إرسال الطلب</>}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default CreateFamForm;