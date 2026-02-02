"use client";

import React, { useState, useEffect } from "react";
import styles from "../styles/familyLeaders.module.css";

interface Leader {
  name: string;
  universityId: string;
  nationalId: string;
  phone: string;
  email: string;
  gender: "M" | "F";
  role: string;
  createdAt: string;
}

const emptyLeader: Leader = {
  name: "",
  universityId: "",
  nationalId: "",
  phone: "",
  email: "",
  gender: "M",
  role: "",
  createdAt: "",
};

const FamilyLeaders: React.FC = () => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Leader>(emptyLeader);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [nationalIdError, setNationalIdError] = useState(false);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2500);
  };

  const fetchLeaders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access");
      const res = await fetch("http://localhost:8000/api/family/faculty/family-founders/", {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("فشل جلب القادة");
      const data = await res.json();
      const formatted = data.map((d: any) => ({
        name: d.name || "",
        universityId: d.university_id || "",
        nationalId: d.national_id,
        phone: d.phone_number || "",
        email: d.email || "",
        gender: d.gender || "M",
        role: d.gender === "F" ? "أخت كبرى / مساعد" : "أخ أكبر / قائد",
        createdAt: new Date().toLocaleDateString("ar-EG", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      }));
      setLeaders(formatted);
    } catch (err: any) {
      showNotification(err.message || "حدث خطأ", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaders();
  }, []);

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setCurrentIndex(null);
    setFormData({ ...emptyLeader, role: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    setIsEditMode(true);
    setCurrentIndex(index);
    setFormData(leaders[index]);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditMode) {
    if (!formData.nationalId.trim()) {
      setNationalIdError(true);
      showNotification("الرجاء إدخال الرقم القومي", "error");
      return;
    }
    setNationalIdError(false); // clear error if valid
  }
    setLoading(true);

    const token = localStorage.getItem("access");

    try {
      if (isEditMode && currentIndex !== null) {
        const updated = [...leaders];
        updated[currentIndex] = {
          ...formData,
          role: formData.gender === "F" ? "أخت كبرى / مساعد" : "أخ أكبر / قائد",
        };
        setLeaders(updated);
        showNotification("تم تحديث بيانات القائد", "success");
      } else {
        await fetch(`http://localhost:8000/api/family/faculty/family-founder/${formData.nationalId}/add/`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            national_id: formData.nationalId,
          }),
        });
        showNotification("تم إضافة القائد بنجاح", "success");
        await fetchLeaders();
      }
      setIsModalOpen(false);
    } catch {
      showNotification("حدث خطأ أثناء حفظ البيانات", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (index: number) => {
    const leader = leaders[index];

    setLoading(true);
    const token = localStorage.getItem("access");

    try {
      await fetch(`http://localhost:8000/api/family/faculty/family-founder/${leader.nationalId}/remove/`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ national_id: leader.nationalId }),
      });
      setLeaders(prev => prev.filter((_, i) => i !== index));
      showNotification("تم حذف القائد بنجاح", "success");
    } catch {
      showNotification("حدث خطأ أثناء حذف القائد", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredLeaders = leaders.filter(leader => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      leader.name.toLowerCase().includes(term) ||
      leader.universityId.toLowerCase().includes(term) ||
      leader.nationalId.toLowerCase().includes(term) ||
      leader.phone.toLowerCase().includes(term) ||
      leader.email.toLowerCase().includes(term)
    );
  });

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {notification && (
          <div className={`${styles.notification} ${notification.type === "success" ? styles.success : styles.error}`}>
            {notification.message}
          </div>
        )}

        <div className={styles.pageHeaderFamily}>
          <div className={styles.headerContentFamily}>
            <h1 className={styles.pageTitle}>قادة الأسر</h1>
            <p className={styles.pageSubtitle}>إنشاء وإدارة قادة الأسر الذين يمكنهم طلب إنشاء أسر</p>
          </div>
        </div>

        <div className={styles.controlsRow}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="بحث بالرقم الجامعي، الاسم، أو الرقم القومي"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className={styles.addButton} onClick={handleOpenCreate} disabled={loading}>
            إنشاء قائد جديد
          </button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.studentsTable}>
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الرقم الجامعي</th>
                <th>الرقم القومي</th>
                <th>الهاتف</th>
                <th>البريد الإلكتروني</th>
                <th>الدور</th>
                <th>تاريخ الإنشاء</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaders.map((leader, index) => (
                <tr key={index}>
                  <td>
                    {leader.name}
                  </td>
                  <td>{leader.universityId}</td>
                  <td>{leader.nationalId}</td>
                  <td>{leader.phone}</td>
                  <td>{leader.email}</td>
                  <td>
                    <span className={leader.role.includes("قائد") ? styles.roleLeader : styles.roleAssistant}>
                      {leader.role}
                    </span>
                  </td>
                  <td>{leader.createdAt}</td>
                  <td className={styles.actionButtons}>
                    <button className={styles.deleteButton} onClick={() => handleDelete(index)} disabled={loading}>
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" > <polyline points="3 6 5 6 21 6" /> <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /> <path d="M10 11v6" /> <path d="M14 11v6" /> </svg>
                    </button>
                    {/* <button className={styles.editButton} onClick={() => handleOpenEdit(index)} disabled={loading}>
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" > <path d="M12 20h9" /> <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /> </svg>
                    </button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className={styles.overlay}>
            <div className={styles.modal} dir="rtl">
              <div className={styles.modalHeader}>
                <h2>{isEditMode ? "تعديل قائد أسرة" : "إنشاء قائد جديد"}</h2>
                <button className={styles.closeBtn} onClick={handleCloseModal} aria-label="إغلاق">
                  ×
                </button>
              </div>

              <p className={styles.modalSubtitle}>
                {isEditMode ? "تعديل بيانات القائد" : "إضافة قائد أسرة جديد برقم قومي فقط"}
              </p>

              <form className={styles.form} onSubmit={handleSubmit}>
                {!isEditMode && (
                  <div className={styles.formGroup}>
                    <label>الرقم القومي</label>
                <input
                  name="nationalId"
                  type="text"
                  placeholder="أدخل الرقم القومي المكوّن من 14 رقم"
                  value={formData.nationalId}
                  onChange={(e) => {
                    handleChange(e);
                    setNationalIdError(false); // clear error on typing
                  }}
                  maxLength={14}
                  style={{ borderColor: nationalIdError ? "red" : undefined }}
                />
                  </div>
                )}

                {isEditMode && (
                  <>
                    <div className={styles.formGroup}>
                      <label>الاسم</label>
                      <input name="name" type="text" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className={styles.formGroup}>
                      <label>الرقم الجامعي</label>
                      <input name="universityId" type="text" value={formData.universityId} onChange={handleChange} required />
                    </div>
                    <div className={styles.formGroup}>
                      <label>الرقم القومي</label>
                      <input name="nationalId" type="text" value={formData.nationalId} onChange={handleChange} maxLength={14} required />
                    </div>
                    <div className={styles.formGroup}>
                      <label>الهاتف</label>
                      <input name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
                    </div>
                    <div className={styles.formGroup}>
                      <label>البريد الإلكتروني</label>
                      <input name="email" type="email" value={formData.email} onChange={handleChange} required />
                    </div>
                  </>
                )}

                <div className={styles.actions}>
                  <button type="button" className={styles.btnSecondary} onClick={handleCloseModal} disabled={loading}>
                    إلغاء
                  </button>
                  <button type="submit" className={styles.btnPrimary} disabled={loading}>
                    {isEditMode ? "حفظ التعديلات" : "إنشاء"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyLeaders;
