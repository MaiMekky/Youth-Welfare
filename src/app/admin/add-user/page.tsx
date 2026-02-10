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

  const [faculties, setFaculties] = useState<{ faculty_id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
 const [notification, setNotification] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    permissions: [] as string[],
    status: true,
    faculty: '', // This will store faculty ID as string
    departments: [] as string[],
  });
 const showNotification = (message: string, type: "success" | "warning" | "error") => {
    setNotification(`${type}:${message}`);
    setTimeout(() => setNotification(null), 3500);
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

  const departmentsList = Object.keys(departmentsMap);

  // Fetch faculties on component mount
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const token = localStorage.getItem('access');
        const response = await fetch('http://localhost:8000/api/solidarity/super_dept/faculties/', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch faculties');
        }

        const facultiesData = await response.json();
        console.log("data: ", facultiesData)
        setFaculties(facultiesData);
      } catch (error) {
        console.error('Error fetching faculties:', error);
       showNotification("حدث خطاء في تحميل الكليات" , "error");
      } finally {
        setLoading(false);
      }
    };

    fetchFaculties();
  }, []);

  useEffect(() => {
    if (isEdit && faculties.length > 0) {
      const token = localStorage.getItem('access');

      fetch(`http://localhost:8000/api/auth/admin_management/${admin_id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {

 let deptNames: string[] = [];

// لو الداتا Array بالفعل
if (Array.isArray(data.dept_name)) {
  deptNames = data.dept_name;
}
// لو الداتا string مش منسق كويس، فيه {} أو commas
else if (typeof data.dept_name === "string") {
  deptNames = data.dept_name
    .replace(/[{}]/g, '')   // شيل الأقواس {}
    .split(',')             // افصل على حسب الفواصل
    .map(s => s.trim());    // شيل الفراغات
}

          // Store faculty ID directly (convert to string for consistency with form state)
          const facultyId = data.faculty ? data.faculty.toString() : '';

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
            faculty: facultyId,
            departments: data.dept_fac_ls
          });
        })
        .catch(err => console.error('Error fetching admin data:', err));
    }
  }, [admin_id, faculties]); // Added faculties to dependencies

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

      // Convert faculty ID to number (empty string becomes null)
      const facultyId = formData.faculty ? Number(formData.faculty) : null;

      // Find faculty name by ID for faculty_name field
      const facultyName = faculties.find(f => f.faculty_id === facultyId)?.name || null;

      const payload = {
        ...(isEdit ? {} : { admin_id: 0 }),
        name: formData.name,
        email: formData.email,
        ...(formData.password && { password: formData.password }),
        role: roleMap[formData.role] || formData.role,

        faculty: facultyId, // Send faculty ID directly
        faculty_name: facultyName,

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
     showNotification("حدث خطأ" + errorText, "error" );
        return;
      }
     showNotification( isEdit ? "تم التحديث بنجاح 🎉" : "تم الإنشاء بنجاح 🎉" , "success");
      router.push('/CreateAdmins');

    } catch (err) {
      console.error(err);
     showNotification("حدث خطأ ما.", "error" );
    }
  };

  if (loading) {
    return (
      <div className={styles.pageWrapper} dir="rtl">
        <div className={styles.centerWrapper}>
          <div className={styles.formCard}>
            <p>جاري تحميل البيانات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper} dir="rtl">
      <div className={styles.centerWrapper}>
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>
            {isEdit ? "تعديل المستخدم" : "إنشاء مستخدم جديد"}
          </h2>
    {notification && (
        <div
          className={`${styles.notification} ${
            notification.startsWith("success")
              ? styles.success
              : notification.startsWith("warning")
              ? styles.warning
              : styles.error
          }`}
        >
          {notification.split(":")[1]}
        </div>
      )}
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
                  {faculties.map(faculty => (
                    <option key={faculty.faculty_id} value={faculty.faculty_id.toString()}>
                      {faculty.name}
                    </option>
                  ))}
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