'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from './access-privileges.module.css';
import { useRouter } from 'next/navigation';

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
  const [toast, setToast] = useState<string | null>(null);

  const permissionColors: { [key: string]: string } = {
    D: styles.permissionD,
    U: styles.permissionU,
    R: styles.permissionR,
    C: styles.permissionC
  };

 useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('access');
        if (!token) throw new Error('Token not found');

        const res = await fetch('http://localhost:8000/api/auth/admin_management/', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const mappedUsers: User[] = data.map((u: any) => ({
          id: u.admin_id.toString(),
          name: u.name,
          email: u.email,
          faculty: u.faculty_name || '',
          departments: u.dept_name || '',
          role: u.role || 'غير محدد',
          permissions: [
            u.can_create ? 'C' : '',
            u.can_read ? 'R' : '',
            u.can_update ? 'U' : '',
            u.can_delete ? 'D' : '',
          ].filter(Boolean),
          status: u.acc_status === 'active',
          lastModified: new Date(u.created_at).toLocaleDateString('ar-EG'),
          modifiedBy: 'مشرف النظام',
        }));

        setUsers(mappedUsers);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    (selectedRole === 'جميع الأدوار' || user.role === selectedRole) &&
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Toggle status and call PATCH
  const toggleStatus = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    try {
      const token = localStorage.getItem('access');
      if (!token) throw new Error('Token not found');

      const updatedStatus = !user.status;

      const res = await fetch(`http://localhost:8000/api/auth/admin_management/${id}/`, {
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

      setToast(`${user.name} أصبح ${updatedStatus ? 'نشط' : 'غير نشط'} الآن`);
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };


  // const filteredUsers = users.filter(user =>
  //   (selectedRole === 'جميع الأدوار' || user.role === selectedRole) &&
  //   (user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  // );

  // const toggleStatus = (id: string) => {
  //   setUsers(prev =>
  //     prev.map(user =>
  //       user.id === id ? { ...user, status: !user.status } : user
  //     )
  //   );

  //   const updatedUser = users.find(u => u.id === id);
  //   if (updatedUser) {
  //     setToast(`${updatedUser.name} أصبح ${updatedUser.status ? 'غير نشط' : 'نشط'} الآن`);
  //     setTimeout(() => setToast(null), 3000);
  //   }
  // };

  const addUser = () => {
    router.push('/admin/add-user'); // فتح صفحة إضافة مستخدم جديد
  };

  return (
    <>
      <Head>
        <title>إدارة صلاحيات الوصول</title>
      </Head>

      <div className={styles.pageWrapper} dir="rtl">
        {toast && <div className={styles.toast}>{toast}</div>}

        <div className={styles.controlsBar}>
          <button className={styles.btnAddUser} onClick={addUser}>إضافة مستخدم</button>

          <div className={styles.selectWrapper}>
            <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className={styles.roleSelect}>
              <option>جميع الأدوار</option>
              <option>مشرف النظام</option>
              <option>مدير عام</option>
              <option>مدير إدارة</option>
              <option>مدير كلية</option>
              <option>مسؤول الكلية</option>
            </select>
          </div>

          <div className={styles.searchWrapper}>
            <input type="text" placeholder="...ابحث بالاسم أو البريد الإلكتروني" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={styles.searchInput} />
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.usersTable}>
            <thead>
              <tr>
                <th>الإجراءات</th>
                <th>آخر تعديل</th>
                <th>الحالة</th>
                <th>الصلاحيات</th>
                <th>الدور</th>
                <th>المستخدم</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
  <div className={styles.actionButtons}>
    {/* زر حذف */}
    {/* <button className={`${styles.btnAction} ${styles.btnDelete}`} title="حذف">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6l-1 14H6L5 6"></path>
        <path d="M10 11v6"></path>
        <path d="M14 11v6"></path>
      </svg>
    </button> */}

    {/* زر تعديل */}
    <button
      className={`${styles.btnAction} ${styles.btnEdit}`}
      title="تعديل"
      onClick={() => router.push(`/admin/add-user?id=${user.id}`)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <path d="M12 20h9"></path>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
      </svg>
    </button>
  </div>
</td>

                  <td>
                    <div className={styles.modifiedInfo}>
                      <div className={styles.date}>{user.lastModified}</div>
                      { 
                        // <div className={styles.modifiedBy}>{user.modifiedBy}</div>
                      }
                    </div>
                  </td>
                  <td>
                    <div className={styles.statusCell}>
                      <span className={`${styles.statusTag} ${user.status ? 'active' : 'inactive'}`}>
                        {user.status ? 'نشط' : 'غير نشط'}
                      </span>
                      <label className={styles.toggleSwitch}>
                        <input type="checkbox" checked={user.status} onChange={() => toggleStatus(user.id)} />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </div>
                  </td>
                  <td>
                    <div className={styles.permissions}>
                      {user.permissions.map(perm => (
                        <span key={perm} className={`${styles.permissionBadge} ${permissionColors[perm]}`}>{perm}</span>
                      ))}
                    </div>
                  </td>
                  <td><span className={styles.roleBadge}>{user.role}</span></td>
                  <td>
                    <div className={styles.userInfo}>
                      <div className={styles.userName}>{user.name}</div>
                      <div className={styles.userEmail}>{user.email}</div>
                      {user.faculty && <div className={styles.userMeta}>{user.faculty}</div>}
                      {user.departments && <div className={styles.userMeta}>{user.departments}</div>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
