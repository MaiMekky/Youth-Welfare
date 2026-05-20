"use client";

import React, { useEffect, useState } from 'react';
import styles from './details.module.css';
import { useParams, useRouter } from "next/navigation";
import Footer from "@/app/FacLevel/components/Footer";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";

interface FamilyData {
  name: string;
  totalMembers: number;
  activities: number;
  goals: number;
  participation: string;
  foundingDate: string;
  coordinator: string;
  supervisor: string;
  category: string;
  description: string;
}

interface Activity {
  eventId: number;
  name: string;
  date: string;
  type: string;
  participants: number;
}
interface FamilyAdmin {
  name: string;
  nid: number;
  phone: number;
  role: string;
}

interface Student {
  memberId: number;
  name: string;
  id: string;
  nationalId: number;
  dept_id?: number;
  major: string;
  status: string;
  role: string;
  joinDate: string;
}
const STUDENT_ROLES = [
  'أخ أكبر',
  'أخت كبرى',
  'أمين سر',
  'عضو منتخب',
  'أمين لجنة',
  'أمين مساعد لجنة',
  'عضو',
];

const ADMIN_ROLES = [
  'رائد',
  'نائب رائد',
  'مسؤول',
  'أمين صندوق',
];

const DEPT_ROLES = ['أمين لجنة', 'أمين مساعد لجنة'];


function getStoredInactiveIds(): number[] {
  try {
    const raw = localStorage.getItem("inactive_family_ids");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function FamilyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { showToast } = useToast();
  const [isInactive, setIsInactive] = useState(false);

  const [familyData, setFamilyData] = useState<FamilyData>({
    name: '',
    totalMembers: 0,
    activities: 0,
    goals: 0,
    participation: '0%',
    foundingDate: '',
    coordinator: '',
    supervisor: '',
    category: '',
    description: '',
  });

  const [activitiesData, setActivitiesData] = useState<Activity[]>([]);
  const [studentsData, setStudentsData] = useState<Student[]>([]);
  const [nid, setNid] = useState("");
  const [adding, setAdding] = useState(false);
  const [adminsData, setAdminsData] = useState<FamilyAdmin[]>([]);
  const [editingStudent, setEditingStudent] = useState<number | null>(null);
  const [editingAdmin,   setEditingAdmin]   = useState<number | null>(null);
  const [draftStudent,   setDraftStudent]   = useState<Partial<Student>>({});
  const [draftAdmin,     setDraftAdmin]     = useState<Partial<FamilyAdmin>>({});
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState<{ dept_id: number; name: string }[]>([]);

useEffect(() => {
  if (!id) return;
  const fetchFamilyInfo = async () => {
    try {

      // Fetch family details
      const resFamily = await authFetch(
        `${getBaseUrl()}/api/family/faculty/${id}/details/`
      );
      if (!resFamily.ok) throw new Error("فشل جلب تفاصيل الأسرة");
      const dataFamily = await resFamily.json();

       const storedInactiveIds = getStoredInactiveIds();
        const familyIsInactive =
          dataFamily.status === "inactive" ||
          storedInactiveIds.includes(Number(id));
        setIsInactive(familyIsInactive);

      // Extract coordinator & supervisor
      const coordinatorMember = dataFamily.family_members.find(
        (m: Record<string, unknown>) => m.role === "أخ أكبر"
      );
      const supervisorMember = dataFamily.family_members.find(
        (m: Record<string, unknown>) => m.role === "أخت كبرى"
      );

      // Map students
      const students = dataFamily.family_members.map((member: Record<string, unknown>) => ({
        memberId: member.student_id,
        name: member.student_name,
        id: member.u_id,
        nationalId: member.national_id,
        dept_id: member.dept_id as number | undefined,
        status: member.status,
        major: member.dept_name,
        role: member.role,
        joinDate: new Date(member.joined_at as string).toLocaleDateString("ar-EG"),
      }));
      setStudentsData(students);

      const admins = dataFamily.family_admins ?? [];
      setAdminsData(admins);

      // Fetch activities
      const resActivities = await authFetch(
        `${getBaseUrl()}/api/family/faculty_events/by-family/?family_id=${id}` 
      );
      if (!resActivities.ok) throw new Error("فشل جلب الأنشطة");
      const dataActivities = await resActivities.json();

      const activities = dataActivities.map((event: Record<string, unknown>) => ({
        eventId: event.event_id,
        name: event.title,
        date: new Date(event.st_date as string).toLocaleDateString("ar-EG"),
        type: event.type,
        participants: Number(event.s_limit),
      }));
      setActivitiesData(activities);

      // Update family data once
      setFamilyData({
        name: dataFamily.name,
        totalMembers: students.length,
        activities: activities.length, // ✅ correct count
        goals: 0,
        participation: "0%",
        foundingDate: new Date(dataFamily.created_at).toLocaleDateString("ar-EG"),
        coordinator: coordinatorMember?.student_name ?? "-",
        supervisor: supervisorMember?.student_name ?? "-",
        category: dataFamily.type,
        description: dataFamily.description,
      });
      const resDepts = await authFetch(`${getBaseUrl()}/api/family/departments/`);
      if (resDepts.ok) {
        const depts = await resDepts.json();
        setDepartments(depts);
      }
    } catch (err) {
      console.error(err);
      showToast("❌ حدث خطأ أثناء جلب البيانات", "error");
    }
  };

  fetchFamilyInfo();
}, [id]);

 const guardAction = (label = "لا يمكن تنفيذ هذا الإجراء على أسرة غير مفعّلة") => {
    showToast(label, "warning");
  };


  const handleBack = () => router.push('/Family-Faclevel/families-reports');
  const handleRemoveMember = async (memberId: number) => {
  try {
     if (isInactive) return guardAction();
    const res = await authFetch(
      `${getBaseUrl()}/api/family/faculty_members/families/${id}/members/${memberId}/`,
      {
        method: "DELETE",
      }
    );

    if (!res.ok) throw new Error("Failed to delete member");

    
    setStudentsData(prev =>
      prev.filter(student => student.memberId !== memberId)
    );

    
    setFamilyData(prev => ({
      ...prev,
      totalMembers: prev.totalMembers - 1,
    }));

    
    showToast("✅ تم حذف الطالب بنجاح", "success");

  } catch (err) {
    console.error(err);

   
    showToast("❌ فشل حذف الطالب", "error");
  }
};
const handleAddMember = async () => {
   if (isInactive) return guardAction();
  if (!nid.trim()) {
    showToast("❌ أدخل الرقم القومي أولاً", "error");
    return;
  }

  try {
    setAdding(true);


    const res = await authFetch(
      `${getBaseUrl()}/api/family/faculty_members/families/${id}/add-member/${nid}/`,
      {
        method: "POST",
      }
    );

    if (!res.ok) throw new Error("Failed");


  const newMember = await res.json();
  console.log("Add member response:", newMember);

  const student: Student = {
    memberId: newMember.student_id ?? newMember.id ?? newMember.member_id ?? 0,
    name:     newMember.student_name ?? newMember.name ?? newMember.full_name ?? "—",
    id:       newMember.u_id ?? newMember.university_id ?? newMember.national_id ?? nid,
    nationalId: newMember.national_id ?? 0,
    major:    newMember.dept_name ?? newMember.major ?? newMember.department ?? "—",
    role:     newMember.role ?? "عضو",
    joinDate: newMember.joined_at
      ? new Date(newMember.joined_at).toLocaleDateString("ar-EG")
      : new Date().toLocaleDateString("ar-EG"),
    status: newMember.status ?? "مقبول",
  };
  // If critical fields are still missing, re-fetch the full member list
  if (!student.name || student.name === "—") {
    // Re-fetch family data to get the newly added member with full info
    const resFresh = await authFetch(`${getBaseUrl()}/api/family/faculty/${id}/details/`);
    if (resFresh.ok) {
      const freshData = await resFresh.json();
      const freshStudents = freshData.family_members.map((member: Record<string, unknown>) => ({
        memberId: member.student_id,
        name: member.student_name,
        id: member.u_id,
        nationalId: member.national_id,
        dept_id: member.dept_id as number | undefined,
        major: member.dept_name,
        role: member.role,
        joinDate: new Date(member.joined_at as string).toLocaleDateString("ar-EG"),
      }));
      setStudentsData(freshStudents);
      setFamilyData(prev => ({ ...prev, totalMembers: freshStudents.length }));
      setNid("");
      showToast("✅ تم إضافة الطالب بنجاح", "success");
      return; // exit early, state already updated
    }
  }

  setStudentsData(prev => [...prev, student]);
  setFamilyData(prev => ({ ...prev, totalMembers: prev.totalMembers + 1 }));

    setNid("");

    showToast("✅ تم إضافة الطالب بنجاح", "success");
  } catch (err) {
    console.error(err);
    showToast("❌ فشل إضافة الطالب", "error");
  } finally {
    setAdding(false);
  }
 
};const handleSaveAll = async (
  updatedStudents: Student[],
  updatedAdmins: FamilyAdmin[],
  options?: { warnIfUnchanged?: boolean }
) => {
  if (isInactive) return guardAction();
  if (options?.warnIfUnchanged) {
    const studentsUnchanged = JSON.stringify(updatedStudents) === JSON.stringify(studentsData);
    const adminsUnchanged = JSON.stringify(updatedAdmins) === JSON.stringify(adminsData);
    if (studentsUnchanged && adminsUnchanged) {
      showToast("⚠️ لم يتم تعديل أي بيانات", "warning");
      return;
    }
  }

  try {
    setSaving(true);
    const body = {
      members: updatedStudents.map(s => ({
        nid:     s.nationalId,
        role:    s.role,
        status:  "مقبول",
        dept_id: s.dept_id ?? 0,
      })),
      admins: updatedAdmins.map((a, idx) => ({
        nid:          a.nid,
        name:         a.name,
        phone:        a.phone,
        role:         a.role,
        replace_role: adminsData[idx]?.role ?? a.role,
      })),
    };

    const res = await authFetch(
      `${getBaseUrl()}/api/family/faculty/${id}/update-members-and-admins/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) throw new Error("فشل التحديث");
    showToast("✅ تم حفظ التغييرات بنجاح", "success");
  } catch (err) {
    console.error(err);
    showToast("❌ فشل حفظ التغييرات", "error");
  } finally {
    setSaving(false);
  }
};
// const handleRemoveAdmin = async (idx: number) => {
//   const updated = adminsData.filter((_, i) => i !== idx);
//   setAdminsData(updated);
//   await handleSaveAll(studentsData, updated);
// };
  // SVG icons
  const icons = {
    members: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="7" r="4"></circle>
        <path d="M5.5 21a6.5 6.5 0 0113 0"></path>
      </svg>
    ),
    activities: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"></path>
      </svg>
    ),
    goals: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 6v6l4 2"></path>
      </svg>
    ),
    goalItem: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 6v6l4 2"></path>
      </svg>
    ),
    activity: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"></path>
      </svg>
    ),
  };
const handleExport = async () => {
  if (isInactive) return guardAction();
  try {
    const res = await authFetch(
      `${getBaseUrl()}/api/family/faculty/${id}/export/`,
      {
        method: "GET",
        headers: {
          Accept: "*/*",
        },
      }
    );

    if (!res.ok) {
      throw new Error("Export failed");
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `family_${familyData.name}.pdf`;
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);

    showToast("✅ تم تصدير ملف PDF بنجاح", "success");
  } catch (error) {
    console.error(error);
    showToast("❌ فشل تصدير ملف PDF", "error");
  }
};

  return (
    <>
      <div className={styles.detailsPage}>
        <header className={styles.detailsHeader}>
          <h1 className={styles.detailsTitle}>تفاصيل الأسرة: {familyData.name}{isInactive && (
              <span className={styles.inactiveBanner}>غير مفعّلة</span>
            )}
          </h1>
          <div className={styles.headerActions}>
            {/* Export hidden when inactive */}
            {!isInactive && (
              <button
                className={`${styles.actionBtn} ${styles.export}`}
                onClick={handleExport}
              >
                <span className={styles.btnIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M12 5v14m7-7H5" />
                  </svg>
                </span>
                تصدير
              </button>
            )}
            <button
              className={`${styles.actionBtn} ${styles.back}`}
              onClick={handleBack}
            >
              <span className={styles.btnIcon}>←</span>
              العودة للقائمة
            </button>
          </div>
        </header>
        
        {/* --- Statistics Cards --- */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.members}`}>{icons.members}</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{familyData.totalMembers}</div>
              <div className={styles.statLabel}>إجمالي الأعضاء</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.activities}`}>{icons.activities}</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{familyData.activities}</div>
              <div className={styles.statLabel}>الأنشطة المنجزة</div>
            </div>
          </div>
        </div>

        {/* --- Content Grid --- */}
        <div className={styles.contentGrid}>
          <div className={styles.infoCard}>
            <h2 className={styles.cardTitle}>معلومات عامة</h2>
            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>تاريخ التأسيس:</span>
                <span className={styles.infoValue}>{familyData.foundingDate}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>الاخ الأكبر:</span>
                <span className={styles.infoValue}>{familyData.coordinator}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>الاخت الكبري:</span>
                <span className={styles.infoValue}>{familyData.supervisor}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>الفئة:</span>
                <span className={styles.infoValue}>{familyData.category}</span>
              </div>
            </div>
          </div>

 {/* --- Activities --- */}
        <div className={styles.activitiesCard}>
          <h2 className={styles.cardTitle}>الأنشطة والفعاليات</h2>
          <div className={styles.activitiesList}>
            {activitiesData.map((act, idx) => (
              <div key={idx} className={styles.activityItem}>
                <div className={styles.activityHeader}>
                  <div className={styles.activityInfo}>
                    <div className={styles.activityIcon}>{icons.activity}</div>
                    <div>
                      <h3 className={styles.activityName}>{act.name}</h3>
                      <p className={styles.activityDate}>{act.date}</p>
                    </div>
                  </div>
                  <div className={styles.activityActionsCenter}>
                <div className={styles.activityMetaCenter}>
                  <span className={styles.activityType}>{act.type}</span>
                  <span className={styles.activityParticipants}>
                    {act.participants} مشارك
                  </span>
                </div>

                <button
                  className={styles.viewDetailsBtn}
                  title="عرض جميع تفاصيل الفعالية"
                  onClick={() =>
                    router.push(`/Family-Faclevel/families-reports/${id}/${act.eventId}`)
                  }
                >
                  <span className={styles.btnIcon}>
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
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"></path>
                    </svg>
                  </span>
                  عرض التفاصيل الكاملة
                </button>
              </div>
                              </div>
              </div>
            ))}
          </div>
        </div>
          {/* <div className={styles.infoCard}>
            <h2 className={styles.cardTitle}>أهداف الأسرة</h2>
            <ul className={styles.goalsList}>
              {goalsData.map((goal, idx) => (
                <li key={idx} className={styles.goalItem}>
                  <span className={styles.goalIcon}>{icons.goalItem}</span>{goal}
                </li>
              ))}
            </ul>
          </div> */}
        </div>

        {/* --- Description --- */}
        <div className={styles.descriptionCard}>
          <h2 className={styles.cardTitle}>وصف الأسرة</h2>
          <p className={styles.descriptionText}>{familyData.description}</p>
        </div>

        {/* --- Family Admins Table --- */}
       <div className={styles.studentsCard}>
          <div className={styles.studentsHeader}>
            <h2 className={styles.cardTitle}>مشرفو الأسرة</h2>
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.studentsTable}>
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>الرقم القومي</th>
                  <th>رقم الهاتف</th>
                  <th>الدور</th>
                  {/* Hide actions column header when inactive */}
                  {!isInactive && <th>الإجراءات</th>}
                </tr>
              </thead>
              <tbody>
                {adminsData.map((admin, idx) => {
                  const isEditing = !isInactive && editingAdmin === idx;
                  return (
                    <tr key={idx}>
                      <td>{isEditing ? (
                        <input type="text" value={draftAdmin.name ?? admin.name}
                          onChange={e => setDraftAdmin(d => ({ ...d, name: e.target.value }))}
                          className={styles.editInput} />
                      ) : admin.name}</td>

                      <td>{isEditing ? (
                        <input type="text" value={draftAdmin.nid ?? admin.nid}
                          onChange={e => setDraftAdmin(d => ({ ...d, nid: Number(e.target.value) }))}
                          className={styles.editInput} />
                      ) : admin.nid}</td>

                      <td>{isEditing ? (
                        <input type="text" value={draftAdmin.phone ?? admin.phone}
                          onChange={e => setDraftAdmin(d => ({ ...d, phone: Number(e.target.value) }))}
                          className={styles.editInput} />
                      ) : admin.phone}</td>

                      <td>{admin.role}</td>

                      {/* Actions cell hidden when inactive */}
                      {!isInactive && (
                        <td className={styles.actionsCell}>
                          {isEditing ? (
                            <>
                              <button className={styles.saveBtn} disabled={saving}
                                onClick={async () => {
                                  const updated = adminsData.map((a, i) =>
                                    i === idx ? { ...a, ...draftAdmin } : a);
                                  setAdminsData(updated);
                                  setEditingAdmin(null);
                                  await handleSaveAll(studentsData, updated, { warnIfUnchanged: true });
                                }}>✓</button>
                              <button className={styles.cancelBtn}
                                onClick={() => setEditingAdmin(null)}>✕</button>
                            </>
                          ) : (
                            <button className={styles.editBtn} title="تعديل"
                              onClick={() => {
                                setEditingAdmin(idx);
                                setDraftAdmin({ name: admin.name, phone: admin.phone, role: admin.role, nid: admin.nid });
                              }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                strokeLinejoin="round" viewBox="0 0 24 24">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- Students Table --- */}
        <div className={styles.studentsCard}>
          <div className={styles.studentsHeader}>
            <h2 className={styles.cardTitle}>الطلاب المسجلون</h2>
            {/* Add member box hidden when inactive */}
            {!isInactive && (
              <div className={styles.addMemberBox}>
                <input
                  type="text"
                  placeholder="ادخل الرقم القومي"
                  value={nid}
                  onChange={(e) => setNid(e.target.value)}
                  className={styles.nidInput}
                />
                <button
                  className={styles.addBtn}
                  onClick={handleAddMember}
                  disabled={adding}
                >
                  إضافة
                </button>
              </div>
            )}
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.studentsTable}>
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>الرقم الجامعي</th>
                  <th>الرقم القومي</th>
                  <th>الحالة</th>
                  <th>التخصص</th>
                  <th>الدور</th>
                  <th>تاريخ الانضمام</th>
                  {/* Hide actions column header when inactive */}
                  {!isInactive && <th>الإجراءات</th>}
                </tr>
              </thead>
              <tbody>
                {studentsData.map((student, idx) => {
                  const isEditing = !isInactive && editingStudent === idx;
                  const currentRole = isEditing ? (draftStudent.role ?? student.role) : student.role;
                  const showDeptSelect = isEditing && DEPT_ROLES.includes(currentRole);

                  return (
                    <tr key={idx}>
                      <td>{student.name}</td>
                      <td>{student.id}</td>
                      <td>{isEditing ? (
                        <input type="text" value={draftStudent.nationalId ?? student.nationalId}
                          onChange={e => setDraftStudent(d => ({ ...d, nationalId: Number(e.target.value) }))}
                          className={styles.editInput} />
                      ) : student.nationalId}</td>
                      <td>{student.status}</td>
                      <td>{showDeptSelect ? (
                        <select value={draftStudent.dept_id ?? student.dept_id ?? ''}
                          onChange={e => {
                            const dept = departments.find(d => d.dept_id === Number(e.target.value));
                            setDraftStudent(d => ({ ...d, dept_id: Number(e.target.value), major: dept?.name ?? d.major }));
                          }}
                          className={styles.editSelect}>
                          <option value="" disabled hidden>-- اختر الإدارة --</option>
                          {departments.map(dept => (
                            <option key={dept.dept_id} value={dept.dept_id}>{dept.name}</option>
                          ))}
                        </select>
                      ) : student.major}</td>
                      <td>{isEditing ? (
                        <select value={currentRole}
                          onChange={e => {
                            const newRole = e.target.value;
                            setDraftStudent(d => ({
                              ...d, role: newRole,
                              ...(DEPT_ROLES.includes(newRole) ? {} : { dept_id: undefined, major: student.major }),
                            }));
                          }}
                          className={styles.editSelect}>
                          {STUDENT_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      ) : student.role}</td>
                      <td>{student.joinDate}</td>

                      {/* Actions cell hidden when inactive */}
                      {!isInactive && (
                        <td className={styles.actionsCell}>
                          {isEditing ? (
                            <>
                              <button className={styles.saveBtn} disabled={saving}
                                onClick={async () => {
                                  const updated = studentsData.map((s, i) =>
                                    i === idx ? { ...s, ...draftStudent } : s);
                                  setStudentsData(updated);
                                  setEditingStudent(null);
                                  await handleSaveAll(updated, adminsData, { warnIfUnchanged: true });
                                }}>✓</button>
                              <button className={styles.cancelBtn}
                                onClick={() => setEditingStudent(null)}>✕</button>
                            </>
                          ) : (
                            <>
                              <button className={styles.editBtn} title="تعديل"
                                onClick={() => {
                                  setEditingStudent(idx);
                                  setDraftStudent({ role: student.role, nationalId: student.nationalId, dept_id: student.dept_id });
                                }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
                                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                  strokeLinejoin="round" viewBox="0 0 24 24">
                                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              <button className={styles.deleteBtn} title="حذف"
                                onClick={() => handleRemoveMember(student.memberId)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
                                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                  strokeLinejoin="round" viewBox="0 0 24 24">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6l-1 14H6L5 6" />
                                  <path d="M10 11v6" /><path d="M14 11v6" />
                                </svg>
                              </button>
                            </>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}