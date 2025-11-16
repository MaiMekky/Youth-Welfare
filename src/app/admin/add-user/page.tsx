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
    'فني': 1,
    'ثقافي': 2,
    'رياضي': 3,
    'اجتماعي': 4,
    'أسر': 5,
    'علمي': 6,
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
        const mappedDepartments = departmentsList.filter(dep => deptNames.includes(dep));
          setFormData({
            name: data.name,
            email: data.email,
            password: '',  // كلمة المرور عادة ما يتم إعادة تعيينها عند التعديل
            role: Object.keys(roleMap).find(k => roleMap[k] === data.role) || '',
            permissions: [
              ...(data.can_create ? ['C'] : []),
              ...(data.can_read ? ['R'] : []),
              ...(data.can_update ? ['U'] : []),
              ...(data.can_delete ? ['D'] : [])
            ],
            status: data.acc_status === 'active',
            faculty: Object.keys(facultyMap).find(k => facultyMap[k] === data.faculty) || '',
            departments: data.dept_name ? data.dept_name.split(', ') : [],
          });
        })
        .catch(err => console.error('Error fetching admin data:', err));
    }
  }, [admin_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, checked, type } = e.target;

    if (type === 'checkbox' && name === 'departments') {
      setFormData(prev => ({
        ...prev,
        departments: checked
          ? [...prev.departments, value]
          : prev.departments.filter(d => d !== value)
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

    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
        ...(isEdit ? {} : { admin_id: 0 }), // admin_id موجود بس في POST إذا لازم
        name: formData.name,
        email: formData.email,
        ...(formData.password && { password: formData.password }),
        role: roleMap[formData.role] || formData.role,
        faculty: formData.faculty ? facultyMap[formData.faculty] : null,
        faculty_name: formData.faculty || null,
        dept: formData.departments.length > 0 ? departmentsMap[formData.departments[0]] : null,
        dept_name: formData.departments.length > 0 ? formData.departments.join(', ') : null,
        acc_status: formData.status ? 'active' : 'inactive',
        can_create: formData.permissions.includes('C'),
        can_read: formData.permissions.includes('R'),
        can_update: formData.permissions.includes('U'),
        can_delete: formData.permissions.includes('D'),
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
        console.error('API Error:', errorText);
        alert('حدث خطأ أثناء إرسال البيانات: ' + errorText);
        return;
      }

      alert(isEdit ? 'تم تحديث المستخدم بنجاح' : 'تم إنشاء المستخدم بنجاح');
      router.push('/CreateAdmins');

    } catch (error) {
      console.error('Error submitting form:', error);
      alert('حدث خطأ ما.');
    }
  };


  return (
    <div className={styles.pageWrapper} dir="rtl">
      <div className={styles.centerWrapper}>
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>  {isEdit ? "تعديل المستخدم" : "إنشاء مستخدم جديد"}</h2>
          <p className={styles.formSubtitle}>{isEdit ? "تعديل معلومات المستخدم" : "إنشاء حساب جديد مع تحديد الصلاحيات والحالة."}</p>

          <form onSubmit={handleSubmit} className={styles.formContent}>
            <h3 className={styles.sectionTitle}>معلومات المستخدم</h3>

            <input
              type="text"
              name="name"
              placeholder="أدخل الاسم الكامل"
              className={styles.inputField}
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="أدخل البريد الإلكتروني"
              className={styles.inputField}
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="أدخل كلمة المرور"
              className={styles.inputField}
              value={formData.password}
              onChange={handleChange}
              required
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

            {formData.role === 'faculty_admin' && (
              <>
                <h3 className={styles.sectionTitle}>اختر الكلية</h3>
                <select
                  name="faculty"
                  className={styles.selectField}
                  value={formData.faculty}
                  onChange={handleChange}
                >
                  <option value=""hidden>اختر الكلية</option>
                  {faculties.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>

                <h3 className={styles.sectionTitle}>اختر الأقسام</h3>
                {departmentsList.map((dep) => (
                  <label key={dep} className={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      name="departments"
                      value={dep}
                      onChange={handleChange}
                    />
                    {dep}
                  </label>
                ))}
              </>
            )}
{formData.role === 'faculty_head' && faculties.length > 0 && (
  <>
    <h3 className={styles.sectionTitle}>اختر الكلية</h3>
    <select
      name="faculty"
      className={styles.selectField}
      value={formData.faculty}
      onChange={handleChange}
    >
      <option value="">اختر الكلية</option>
      {faculties.map((f) => (
        <option key={f} value={f}>{f}</option>
      ))}
    </select>
  </>
)}

     {formData.role === 'department_manager' && departmentsList.length > 0 && (
  <>
    <h3 className={styles.sectionTitle}>اختر الأقسام</h3>
    {departmentsList.map((dep) => (
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

 <h3 className={styles.sectionTitle}>صلاحيات الوصول</h3>
<label className={styles.checkboxRow}>
<input type="checkbox" name="permissions" checked={formData.permissions.includes('C')} value="C" onChange={handleChange} />
إنشاء
</label>


<label className={styles.checkboxRow}>
<input type="checkbox" name="permissions"checked={formData.permissions.includes('R')} value="R" onChange={handleChange} />
قراءة
</label>


<label className={styles.checkboxRow}>
<input type="checkbox" name="permissions"checked={formData.permissions.includes('U')} value="U" onChange={handleChange} />
تعديل
</label>


<label className={styles.checkboxRow}>
<input type="checkbox" name="permissions" checked={formData.permissions.includes('D')} value="D" onChange={handleChange} />
حذف
</label>
            <h3 className={styles.sectionTitle}>حالة الحساب</h3>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                name="status"
                value="active"
                checked={formData.status}
                onChange={handleChange}
              />
              الحساب نشط
            </label>

            <div className={styles.buttonsRow}>
              <button type="button" className={styles.btnCancel} onClick={() => router.back()}>
                إلغاء
              </button>
              <button type="submit" className={styles.btnAddUser}>
                 {admin_id ? "تحديث المستخدم" : "إنشاء مستخدم"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}