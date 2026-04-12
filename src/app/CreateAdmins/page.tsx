'use client';

import { useState, useEffect } from 'react';
import styles from './access-privileges.module.css';
import { useRouter } from 'next/navigation';
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";

interface User {
  id: string;
  name: string;
  email: string;
  faculty: string;
  departments: string;
  role: string;
  permissions: string[];
  status: boolean;
  lastModified: string;
  modifiedBy: string;
}

export default function AccessPrivileges() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('جميع الأدوار');
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();
  const { showToast } = useToast();

  const permissionLabels: { [key: string]: string } = {
    D: 'حذف',
    U: 'تعديل',
    R: 'قراءة',
    C: 'إنشاء',
  };

  const permissionColors: { [key: string]: string } = {
    D: styles.permissionD,
    U: styles.permissionU,
    R: styles.permissionR,
    C: styles.permissionC,
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('access');
        if (!token) throw new Error('Token not found');

        const res = await authFetch(`${getBaseUrl()}/api/auth/admin_management/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const mappedUsers: User[] = data.map((u: Record<string, unknown>) => ({
          id: (u.admin_id as number).toString(),
          name: u.name as string,
          email: u.email as string,
          faculty: (u.faculty_name as string) || '',
          departments: (u.dept_name as string) || '',
          role: (u.role as string) || 'غير محدد',
          permissions: [
            u.can_create ? 'C' : '',
            u.can_read   ? 'R' : '',
            u.can_update ? 'U' : '',
            u.can_delete ? 'D' : '',
          ].filter(Boolean) as string[],
          status: u.acc_status === 'active',
          lastModified: new Date(u.created_at as string).toLocaleDateString('ar-EG'),
          modifiedBy: 'مشرف النظام',
        }));

        setUsers(mappedUsers);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };

    fetchUsers();
  }, []);

  // ✅ email lowercase filter
  const filteredUsers = users.filter(user =>
    (selectedRole === 'جميع الأدوار' || user.role === selectedRole) &&
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.trim().toLowerCase()))
  );

  const toggleStatus = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    try {
      const token = localStorage.getItem('access');
      if (!token) throw new Error('Token not found');

      const updatedStatus = !user.status;

      const res = await authFetch(`${getBaseUrl()}/api/auth/admin_management/${id}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ acc_status: updatedStatus ? 'active' : 'inactive' }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setUsers(prev =>
        prev.map(u => (u.id === id ? { ...u, status: updatedStatus } : u))
      );

      showToast(`${user.name} أصبح ${updatedStatus ? 'نشطاً' : 'غير نشط'} الآن`, "success");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className={styles.pageWrapper} dir="rtl">

        {/* ── Page Header ── */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>إدارة صلاحيات الوصول</h1>
            <p className={styles.pageSubtitle}>إدارة المستخدمين وتحديد أدوارهم وصلاحياتهم في النظام</p>
          </div>
          <button className={styles.btnAddUser} onClick={() => router.push('/admin/add-user')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            إضافة مستخدم
          </button>
        </div>

        {/* ── Stats Row ── */}
        <div className={styles.statsRow}>
          <div className={`${styles.statCard} ${styles.statTotal}`}>
            <div className={styles.statNum}>{users.length}</div>
            <div className={styles.statLabel}>إجمالي المستخدمين</div>
          </div>
          <div className={`${styles.statCard} ${styles.statActive}`}>
            <div className={styles.statNum}>{users.filter(u => u.status).length}</div>
            <div className={styles.statLabel}>نشط</div>
          </div>
          <div className={`${styles.statCard} ${styles.statInactive}`}>
            <div className={styles.statNum}>{users.filter(u => !u.status).length}</div>
            <div className={styles.statLabel}>غير نشط</div>
          </div>
          <div className={`${styles.statCard} ${styles.statFiltered}`}>
            <div className={styles.statNum}>{filteredUsers.length}</div>
            <div className={styles.statLabel}>نتائج البحث</div>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className={styles.controlsBar}>
          <div className={styles.searchWrapper}>
            <svg className={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="ابحث بالاسم أو البريد الإلكتروني…"
              value={searchTerm}
              // ✅ lowercase as user types
              onChange={e => setSearchTerm(e.target.value.toLowerCase())}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.selectWrapper}>
            <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className={styles.roleSelect}>
              <option>جميع الأدوار</option>
              <option>مشرف النظام</option>
              <option>مدير عام</option>
              <option>مدير ادارة</option>
              <option>مدير كلية</option>
              <option>مسؤول كلية</option>
            </select>
          </div>
        </div>

               <div className={styles.tableContainer}>
  <table className={styles.usersTable}>
    <thead>
      <tr>
        <th className={styles.thUser}>المستخدم</th>
        <th className={styles.thRole}>الدور</th>
        <th className={styles.thPerms}>الصلاحيات</th>
        <th className={styles.thStatus}>الحالة</th>
        <th className={styles.thDate}>تاريخ الإنشاء</th>
        <th className={styles.thActions}>الإجراءات</th>
      </tr>
    </thead>
    <tbody>
      {filteredUsers.length === 0 ? (
        <tr>
          <td colSpan={6} className={styles.emptyState}>
            <div className={styles.emptyIcon}>👤</div>
            <p>لا يوجد مستخدمون مطابقون للبحث</p>
          </td>
        </tr>
      ) : (
        filteredUsers.map(user => (
          <tr key={user.id}>

            <td className={styles.tdUser}>
              <div className={styles.userInfo}>
                <div className={styles.userAvatar}>{user.name.charAt(0)}</div>
                <div className={styles.userDetails}>
                  <div className={styles.userName}>{user.name}</div>
                  <div className={styles.userEmail}>{user.email}</div>
                  {user.faculty && <div className={styles.userMeta}>{user.faculty}</div>}
                  {user.departments && <div className={styles.userMeta}>{user.departments}</div>}
                </div>
              </div>
            </td>

            <td className={styles.tdRole}>
              <span className={styles.roleBadge}>{user.role}</span>
            </td>

            <td className={styles.tdPerms}>
              <div className={styles.permissions}>
                {user.permissions.length === 0
                  ? <span className={styles.noPerms}>—</span>
                  : user.permissions.map(perm => (
                    <span
                      key={perm}
                      className={`${styles.permissionBadge} ${permissionColors[perm]}`}
                      title={permissionLabels[perm]}
                    >
                      {permissionLabels[perm]}
                    </span>
                  ))
                }
              </div>
            </td>

            <td className={styles.tdStatus}>
              <div className={styles.statusCell}>
                <label className={styles.toggleSwitch} title={user.status ? 'إلغاء التفعيل' : 'تفعيل'}>
                  <input type="checkbox" checked={user.status} onChange={() => toggleStatus(user.id)} />
                  <span className={styles.toggleSlider}></span>
                </label>
                <span className={`${styles.statusTag} ${user.status ? styles.statusActive : styles.statusInactive}`}>
                  {user.status ? 'نشط' : 'غير نشط'}
                </span>
              </div>
            </td>

            <td className={styles.tdDate}>
              <span className={styles.dateText}>{user.lastModified}</span>
            </td>

            <td className={styles.tdActions}>
              <button
                className={styles.btnEdit}
                title="تعديل"
                onClick={() => router.push(`/admin/add-user?id=${user.id}`)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
                تعديل
              </button>
            </td>

          </tr>
        ))
      )}
    </tbody>
  </table>
</div>
      </div>
    </>
  );
}
