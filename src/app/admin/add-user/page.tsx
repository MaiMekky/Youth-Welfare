"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/app/CreateAdmins/access-privileges.module.css';
import { useSearchParams } from 'next/navigation';
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from '@/app/context/ToastContext';
import { handleBackendError } from '@/utils/errorHandler';

function AddUserContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const admin_id = searchParams.get("id");
  const isEdit = Boolean(admin_id);
  const { showToast } = useToast();

  const [faculties, setFaculties] = useState<{ faculty_id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<{ dept_id: number; name: string }[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    permissions: [] as string[],
    status: true,
    faculty: '',
    departments: [] as string[],
  });

  const roleMap: { [key: string]: string } = {
    "faculty_admin":       "مسؤول كلية",
    "faculty_head":        "مدير كلية",
    "department_manager":  "مدير ادارة",
    "general_admin":       "مدير عام",
    "super_admin":         "مشرف النظام",
  };
  
//   const validatePassword = (password: string) => {
//   const minLength = 8;
//   const hasUpper  = /[A-Z]/.test(password);
//   const hasLower  = /[a-z]/.test(password);
//   const hasNumber = /[0-9]/.test(password);

//   if (password.length < minLength) {
//     return "كلمة المرور يجب أن تكون 8 أحرف على الأقل";
//   }
//   if (!hasUpper) {
//     return "يجب أن تحتوي على حرف كبير واحد على الأقل";
//   }
//   if (!hasLower) {
//     return "يجب أن تحتوي على حرف صغير واحد على الأقل";
//   }
//   if (!hasNumber) {
//     return "يجب أن تحتوي على رقم واحد على الأقل";
//   }

//   return null; // valid
// };

const validateEmail = (email: string) => {
  const normalized = email.trim().toLowerCase();

  // Strong but practical regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (!normalized) {
    return "البريد الإلكتروني مطلوب";
  }

  if (!emailRegex.test(normalized)) {
    return "يرجى إدخال بريد إلكتروني صحيح";
  }

  return null;
};
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem('access');

        const [facultiesRes, departmentsRes] = await Promise.all([
          authFetch(`${getBaseUrl()}/api/family/faculties/`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
          }),
          authFetch(`${getBaseUrl()}/api/family/departments/`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
          }),
        ]);

        if (!facultiesRes.ok)   throw new Error('Failed to fetch faculties');
        if (!departmentsRes.ok) throw new Error('Failed to fetch departments');

        const allDepartments = await departmentsRes.json();
        
        // Filter to show only specific departments
        const allowedDeptIds = [1, 2, 3, 4, 5, 6, 7];
    
        const filteredDepartments = allDepartments.filter(
          (dept: { dept_id: number }) => allowedDeptIds.includes(dept.dept_id)
        );

        console.log('All departments:', allDepartments.map((d: any) => d.name));
        console.log('Filtered departments:', filteredDepartments.map((d: any) => d.name));
        console.log('Filtered count:', filteredDepartments.length);

        setFaculties(await facultiesRes.json());
        // If filtering results in empty array, show all departments (fallback)
        setDepartments(filteredDepartments.length > 0 ? filteredDepartments : allDepartments);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        const errorMessage = await handleBackendError(error);
        showToast(errorMessage, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (isEdit && faculties.length > 0) {
      const token = localStorage.getItem('access');
      authFetch(`${getBaseUrl()}/api/auth/admin_management/${admin_id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setFormData({
            name:        data.name,
            email:       data.email,
            password:    '',
            role:        Object.keys(roleMap).find(k => roleMap[k] === data.role) || '',
            permissions: [
              ...(data.can_create ? ['C'] : []),
              ...(data.can_read   ? ['R'] : []),
              ...(data.can_update ? ['U'] : []),
              ...(data.can_delete ? ['D'] : []),
            ],
            status:      data.acc_status === 'active',
            faculty:     data.faculty ? data.faculty.toString() : '',
            departments: data.dept 
              ? [data.dept.toString()] 
              : data.dept_fac_ls 
                ? data.dept_fac_ls.map((id: number) => id.toString()) 
                : [],
          });
        })
        .catch(err => console.error('Error fetching admin data:', err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin_id, faculties]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

   if (name === 'email') {
    setFormData(prev => ({ ...prev, email: value.trimStart().toLowerCase() }));
    return;
  }

    if (formData.role === "department_manager" && name === "departments") {
      setFormData(prev => ({ ...prev, departments: [value] }));
      return;
    }

    if (type === 'checkbox' && name === 'departments') {
      setFormData(prev => ({
        ...prev,
        departments: checked
          ? [...prev.departments, value]
          : prev.departments.filter(dep => dep !== value)
      }));
      return;
    }

    if (type === 'checkbox' && name === 'permissions') {
      setFormData(prev => ({
        ...prev,
        permissions: checked
          ? [...prev.permissions, value]
          : prev.permissions.filter(p => p !== value)
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const token = localStorage.getItem('access');
    if (!token) throw new Error('User not authenticated');
    // ✅ EMAIL VALIDATION
    const emailError = validateEmail(formData.email);
    if (emailError) {
      showToast(emailError, "error");
      return;
    }
    // // ✅ PASSWORD VALIDATION LOGIC
    // if (!isEdit) {
    //   // CREATE → required
    //   const error = validatePassword(formData.password);
    //   if (error) {
    //     showToast(error, "error");
    //     return;
    //   }
    // } else if (isEdit && formData.password) {
    //   // EDIT → only if user typed password
    //   const error = validatePassword(formData.password);
    //   if (error) {
    //     showToast(error, "error");
    //     return;
    //   }
   // }

    const url    = isEdit
      ? `${getBaseUrl()}/api/auth/admin_management/${admin_id}/`
      : `${getBaseUrl()}/api/auth/admin_management/`;

    const method = isEdit ? 'PATCH' : 'POST';

    const facultyId   = formData.faculty ? Number(formData.faculty) : null;
    const facultyName = faculties.find(f => f.faculty_id === facultyId)?.name || null;

    const normalizedEmail = formData.email.trim().toLowerCase();

    const payload = {
      ...(isEdit ? {} : { admin_id: 0 }),
      name:         formData.name,
      email:        normalizedEmail,
      ...(formData.password && { password: formData.password }), // ✅ already correct
      role:         roleMap[formData.role] || formData.role,
      faculty:      facultyId,
      faculty_name: facultyName,
      dept:         formData.role === "department_manager"
        ? Number(formData.departments[0])
        : null,
      dept_fac_ls:  formData.role === "faculty_admin"
        ? formData.departments.filter(d => d && d !== '').map(Number)
        : [],
      acc_status:   formData.status ? "active" : "inactive",
      can_create:   formData.permissions.includes("C"),
      can_read:     formData.permissions.includes("R"),
      can_update:   formData.permissions.includes("U"),
      can_delete:   formData.permissions.includes("D"),
    };

    const res = await authFetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorMessage = await handleBackendError(res);
      showToast(errorMessage, "error");
      return;
    }

    showToast(isEdit ? "تم التحديث بنجاح 🎉" : "تم الإنشاء بنجاح 🎉", "success");
    router.push('/CreateAdmins');

  } catch (err) {
    console.error(err);
    const errorMessage = await handleBackendError(err);
    showToast(errorMessage, "error");
  }
};
  if (loading) {
    return (
      <div className={styles.pageWrapper} dir="rtl">
        <div className={styles.addUserWrapper}>
          <div className={styles.addUserCard}>
            <p style={{ textAlign: 'center', color: '#6B8299', padding: '40px 0' }}>جاري تحميل البيانات…</p>
          </div>
        </div>
      </div>
    );
  }

  const permLabels: Record<string, string> = { C: 'إنشاء', R: 'قراءة', U: 'تعديل', D: 'حذف' };

  return (
    <div className={styles.pageWrapper} dir="rtl">

      <div className={styles.addUserWrapper}>
        <div className={styles.addUserCard}>

          {/* ── Header ── */}
          <div className={styles.addUserHeader}>
            <div className={styles.addUserHeaderIcon}>
              {isEdit ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              )}
            </div>
            <div>
              <h2 className={styles.addUserTitle}>{isEdit ? "تعديل المستخدم" : "إنشاء مستخدم جديد"}</h2>
              <p className={styles.addUserSubtitle}>{isEdit ? "تعديل بيانات وصلاحيات المستخدم" : "إضافة مستخدم جديد وتحديد دوره وصلاحياته"}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.addUserForm}>

            {/* ── Section: User Info ── */}
            <div className={styles.formSection}>
              <div className={styles.formSectionLabel}>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                معلومات المستخدم
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel}>الاسم</label>
                  <input
                    type="text" name="name"
                    className={styles.addUserInput}
                    placeholder="أدخل الاسم الكامل"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel}>البريد الإلكتروني</label>
                  <input
                    type="email"
                    name="email"
                    className={styles.addUserInput}
                    placeholder="example@domain.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    pattern="[^\s@]+@[^\s@]+\.[^\s@]{2,}"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel}>{isEdit ? "كلمة المرور (اتركها فارغة للإبقاء)" : "كلمة المرور"}</label>
                  <input
                    type="password" name="password"
                    className={styles.addUserInput}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required={!isEdit}
                  />
                </div>
              </div>
            </div>

            {/* ── Section: Role ── */}
            <div className={styles.formSection}>
              <div className={styles.formSectionLabel}>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                الدور الوظيفي
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel}>الدور</label>
                  <select name="role" className={styles.addUserSelect} value={formData.role} onChange={handleChange}>
                    <option value="" hidden>اختر الدور</option>
                    <option value="faculty_admin">مسؤول كلية</option>
                    <option value="faculty_head">مدير كلية</option>
                    <option value="department_manager">مدير ادارة</option>
                    <option value="general_admin">مدير عام</option>
                    <option value="super_admin">مشرف النظام</option>
                  </select>
                </div>

                {(formData.role === "faculty_admin" || formData.role === "faculty_head") && (
                  <div className={styles.formGroup}>
                    <label className={styles.fieldLabel}>الكلية</label>
                    <select name="faculty" className={styles.addUserSelect} value={formData.faculty} onChange={handleChange}>
                      <option value="" hidden>اختر الكلية</option>
                      {faculties.map(f => (
                        <option key={f.faculty_id} value={f.faculty_id.toString()}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.role === "department_manager" && (
                  <div className={styles.formGroup}>
                    <label className={styles.fieldLabel}>القسم</label>
                    <select
                      name="departments"
                      className={styles.addUserSelect}
                      value={formData.departments[0] || ""}
                      onChange={e => setFormData(prev => ({ ...prev, departments: [e.target.value] }))}
                    >
                      <option value="" hidden>اختر القسم</option>
                      {departments.map(dep => (
                      <option key={dep.dept_id} value={dep.dept_id.toString()}>{dep.name}</option>                      ))}
                    </select>
                  </div>
                )}
              </div>

              {formData.role === "faculty_admin" && (
                <div className={styles.formGroup} style={{ marginTop: 12 }}>
                  <label className={styles.fieldLabel}>الأقسام</label>
                  <div className={styles.checkboxGrid}>
                    {departments.map(dep => (
                      <label key={dep.dept_id} className={styles.checkboxCard}>
                        <input
                          type="checkbox" name="departments" value={dep.dept_id.toString()}
                          checked={formData.departments.includes(dep.dept_id.toString())}
                          onChange={handleChange}
                        />
                        <span>{dep.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Section: Permissions ── */}
            <div className={styles.formSection}>
              <div className={styles.formSectionLabel}>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                صلاحيات الوصول
              </div>
              <div className={styles.permissionsGrid}>
                {["C", "R", "U", "D"].map(p => (
                  <label
                    key={p}
                    data-perm={p}
                    className={`${styles.permCard} ${formData.permissions.includes(p) ? styles.permCardActive : ''}`}
                  >
                    <input
                      type="checkbox"
                      name="permissions"
                      value={p}
                      checked={formData.permissions.includes(p)}
                      onChange={handleChange}
                    />
                    <span className={styles.permCardLabel}>{permLabels[p]}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ── Section: Status ── */}
            <div className={styles.formSection}>
              <div className={styles.formSectionLabel}>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                حالة الحساب
              </div>
              <label className={styles.statusToggleRow}>
                <div className={styles.toggleSwitch}>
                  <input type="checkbox" name="status" checked={formData.status} onChange={handleChange} />
                  <span className={styles.toggleSlider}></span>
                </div>
                <span className={styles.statusToggleLabel}>
                  {formData.status ? 'الحساب نشط' : 'الحساب غير نشط'}
                </span>
                <span className={`${styles.statusPill} ${formData.status ? styles.statusPillActive : styles.statusPillInactive}`}>
                  {formData.status ? 'نشط' : 'معطل'}
                </span>
              </label>
            </div>

            {/* ── Buttons ── */}
            <div className={styles.addUserBtns}>
              <button type="button" onClick={() => router.push('/CreateAdmins')} className={styles.addUserBtnCancel}>
                إلغاء
              </button>
              <button type="submit" className={styles.addUserBtnSubmit}>
                {isEdit ? "تحديث المستخدم" : "إنشاء مستخدم"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default function AddUser() {
  return (
    <Suspense fallback={<div className={styles.pageWrapper} dir="rtl"><div className={styles.addUserWrapper}><div className={styles.addUserCard}><p style={{ textAlign: 'center', color: '#6B8299', padding: '40px 0' }}>جاري التحميل…</p></div></div></div>}>
      <AddUserContent />
    </Suspense>
  );
}