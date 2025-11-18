'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/app/CreateAdmins/access-privileges.module.css';
import { useSearchParams } from 'next/navigation';

export default function AddUser() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const admin_id = searchParams.get("id");
  const isEdit = Boolean(admin_id);

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

  const facultyMap: { [key: string]: number } = {
    'كلية الهندسة': 1,
    'كلية العلوم': 2,
    'كلية التجارة': 4,
    'كلية الطب': 3,
    'كلية التربية': 5,
  };

  const departmentsMap: { [key: string]: number } = {
    'فني و ثقافي': 1,
    'رياضي': 2,
    'اجتماعي': 3,
    'أسر': 4,
    'علمي': 5,
    'تكافل': 6,
  };

  const roleMap: { [key: string]: string } = {
    "faculty_admin": "مسؤول كلية",
    "faculty_head": "مدير كلية",
    "department_manager": "مدير ادارة",
    "general_admin": "مدير عام",
    "super_admin": "مشرف النظام",
  };

  const faculties = Object.keys(facultyMap);
  const departmentsList = Object.keys(departmentsMap);

  useEffect(() => {
    if (isEdit) {
      const token = localStorage.getItem('access');

      fetch(`http://localhost:8000/api/auth/admin_management/${admin_id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const deptNames = data.dept_name ? data.dept_name.split(', ') : [];

          setFormData({
            name: data.name,
            email: data.email,
            password: '',
            role: Object.keys(roleMap).find(k => roleMap[k] === data.role) || '',
            permissions: [
              ...(data.can_create ? ['C'] : []),
              ...(data.can_read ? ['R'] : []),
              ...(data.can_update ? ['U'] : []),
              ...(data.can_delete ? ['D'] : [])
            ],
            status: data.acc_status === 'active',
            faculty: Object.keys(facultyMap).find(k => facultyMap[k] === data.faculty) || '',
            departments:
              data.role === "مدير ادارة"
                ? [String(data.dept)] // رقم القسم كـ string في حالة مدير إدارة
                : deptNames, // نصوص الأقسام لمسؤول كلية
          });
        })
        .catch(err => console.error('Error fetching admin data:', err));
    }
  }, [admin_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, checked, type } = e.target;

    if (formData.role === "department_manager" && name === "departments") {
      setFormData(prev => ({
        ...prev,
        departments: [value]
      }));
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

      const url = isEdit
        ? `http://localhost:8000/api/auth/admin_management/${admin_id}/`
        : 'http://localhost:8000/api/auth/admin_management/';

      const method = isEdit ? 'PATCH' : 'POST';

      const payload = {
       ...(isEdit ? {} : { admin_id: 0 }),
  name: formData.name,
  email: formData.email,
  ...(formData.password && { password: formData.password }),
  role: roleMap[formData.role] || formData.role,

  faculty: formData.faculty ? facultyMap[formData.faculty] : null,
  faculty_name: formData.faculty || null,

dept:
  formData.role === "department_manager"
    ? Number(formData.departments[0]) 
    : null,                            

dept_fac_ls:
  formData.role === "faculty_admin"
    ? formData.departments          
    : [],                              

  acc_status: formData.status ? "active" : "inactive",

  can_create: formData.permissions.includes("C"),
  can_read: formData.permissions.includes("R"),
  can_update: formData.permissions.includes("U"),
  can_delete: formData.permissions.includes("D"),
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        alert("خطأ: " + errorText);
        return;
      }

      alert(isEdit ? "تم التحديث" : "تم الإنشاء");
      router.push('/CreateAdmins');

    } catch (err) {
      console.error(err);
      alert('حدث خطأ ما.');
    }
  };

  return (
    <div className={styles.pageWrapper} dir="rtl">
      <div className={styles.centerWrapper}>
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>
            {isEdit ? "تعديل المستخدم" : "إنشاء مستخدم جديد"}
          </h2>

          <form onSubmit={handleSubmit} className={styles.formContent}>
            <h3 className={styles.sectionTitle}>معلومات المستخدم</h3>

            <input
              type="text"
              name="name"
              className={styles.inputField}
              placeholder="الاسم"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              className={styles.inputField}
              placeholder="البريد الإلكتروني"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              className={styles.inputField}
              placeholder="كلمة المرور"
              value={formData.password}
              onChange={handleChange}
              required={!isEdit}
            />

            <h3 className={styles.sectionTitle}>الدور</h3>
            <select
              name="role"
              className={styles.selectField}
              value={formData.role}
              onChange={handleChange}
            >
              <option value="" hidden>اختر الدور</option>
              <option value="faculty_admin">مسؤول كلية</option>
              <option value="faculty_head">مدير كلية</option>
              <option value="department_manager">مدير ادارة</option>
              <option value="general_admin">مدير عام</option>
              <option value="super_admin">مشرف النظام</option>
            </select>

            {/* مسؤول كلية */}
            {formData.role === "faculty_admin" && (
              <>
                <h3 className={styles.sectionTitle}>اختر الكلية</h3>
                <select
                  name="faculty"
                  className={styles.selectField}
                  value={formData.faculty}
                  onChange={handleChange}
                >
                  <option value="" hidden>اختر الكلية</option>
                  {faculties.map(f => <option key={f}>{f}</option>)}
                </select>

                <h3 className={styles.sectionTitle}>اختر الأقسام</h3>
                {departmentsList.map(dep => (
                  <label key={dep} className={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      name="departments"
                      value={dep}
                      checked={formData.departments.includes(dep)}
                      onChange={handleChange}
                    />
                    {dep}
                  </label>
                ))}
              </>
            )}

            {/* مدير إدارة */}
            {formData.role === "department_manager" && (
              <>
                <h3 className={styles.sectionTitle}>اختر القسم</h3>
                <select
                  name="departments"
                  className={styles.selectField}
                  value={formData.departments[0] || ""}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      departments: [e.target.value],
                    }))
                  }
                >
                  <option value="" hidden>اختر القسم</option>
                  {departmentsList.map(dep => (
                    <option key={dep} value={departmentsMap[dep]}>
                      {dep}
                    </option>
                  ))}
                </select>
              </>
            )}

            <h3 className={styles.sectionTitle}>صلاحيات الوصول</h3>
            {["C", "R", "U", "D"].map((p) => (
              <label key={p} className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  name="permissions"
                  value={p}
                  checked={formData.permissions.includes(p)}
                  onChange={handleChange}
                />
                {p === "C" ? "إنشاء" :
                 p === "R" ? "قراءة" :
                 p === "U" ? "تعديل" : "حذف"}
              </label>
            ))}

            <h3 className={styles.sectionTitle}>حالة الحساب</h3>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                name="status"
                checked={formData.status}
                onChange={handleChange}
              />
              الحساب نشط
            </label>

            <div className={styles.buttonsRow}>
              <button type="button" onClick={() => router.back()} className={styles.btnCancel}>
                إلغاء
              </button>
              <button type="submit" className={styles.btnAddUser}>
                {isEdit ? "تحديث المستخدم" : "إنشاء مستخدم"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
