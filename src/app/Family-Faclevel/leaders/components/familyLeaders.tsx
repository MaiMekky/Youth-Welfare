"use client";

import React, { useState } from "react";
import styles from "../styles/familyLeaders.module.css";

interface Leader {
  name: string;
  universityId: string;
  nationalId: string;
  phone: string;
  email: string;
  role: string;
  createdAt: string;
}

const initialLeadersData: Leader[] = [
  {
    name: "أحمد محمد السيد",
    universityId: "2021001234",
    nationalId: "30101012345678",
    phone: "+20 100 123 4567",
    email: "ahmed.mohamed@student.helwan.edu.eg",
    role: "أخ أكبر / قائد",
    createdAt: "الأحد، 12 ربيع الأول 1446 هـ",
  },
  {
    name: "فاطمة علي حسن",
    universityId: "2021002345",
    nationalId: "30202023456789",
    phone: "+20 101 234 5678",
    email: "fatma.ali@student.helwan.edu.eg",
    role: "أخت كبرى / مساعد",
    createdAt: "الجمعة، 17 ربيع الأول 1446 هـ",
  },
];

const emptyLeader: Leader = {
  name: "",
  universityId: "",
  nationalId: "",
  phone: "",
  email: "",
  role: "أخ أكبر / قائد",
  createdAt: "",
};

const FamilyLeaders: React.FC = () => {
  const [leaders, setLeaders] = useState<Leader[]>(initialLeadersData);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Leader>(emptyLeader);

  // حالة البحث
  const [searchTerm, setSearchTerm] = useState("");

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setCurrentIndex(null);
    setFormData(emptyLeader);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    setIsEditMode(true);
    setCurrentIndex(index);
    setFormData(leaders[index]);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditMode && currentIndex !== null) {
      // تحديث
      const updated = [...leaders];
      updated[currentIndex] = formData;
      setLeaders(updated);
    } else {
      // إنشاء جديد
      const newLeader: Leader = {
        ...formData,
        createdAt:
          formData.createdAt ||
          new Date().toLocaleDateString("ar-EG", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
      };
      setLeaders(prev => [...prev, newLeader]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (index: number) => {
    const filtered = leaders.filter((_, i) => i !== index);
    setLeaders(filtered);
  };

  // فلترة القادة حسب البحث
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
        {/* Header */}
        <div className={styles.pageHeaderFamily}>
          <div className={styles.headerContentFamily}>
            <h1 className={styles.pageTitle}>قادة الأسر</h1>
            <p className={styles.pageSubtitle}>
              إنشاء وإدارة قادة الأسر الذين يمكنهم طلب إنشاء أسر
            </p>
          </div>
        </div>

        {/* Controls row */}
        <div className={styles.controlsRow}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="بحث بالرقم الجامعي، الاسم، أو الرقم القومي"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className={styles.addButton} onClick={handleOpenCreate}>
            إنشاء قائد جديد
          </button>
        </div>

        {/* Table */}
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
                  <td>{leader.name}</td>
                  <td>{leader.universityId}</td>
                  <td>{leader.nationalId}</td>
                  <td>{leader.phone}</td>
                  <td>{leader.email}</td>
                  <td>
                    <span
                      className={
                        leader.role.includes("قائد")
                          ? styles.roleLeader
                          : styles.roleAssistant
                      }
                    >
                      {leader.role}
                    </span>
                  </td>
                  <td>{leader.createdAt}</td>
                  <td className={styles.actionButtons}>
                    <button
                      className={styles.deleteButton}
                      title="حذف"
                      onClick={() => handleDelete(index)}
                    >
                      {/* نفس SVG */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                    </button>

                    <button
                      className={styles.editButton}
                      title="تعديل"
                      onClick={() => handleOpenEdit(index)}
                    >
                      {/* نفس SVG */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal form */}
        {isModalOpen && (
          <div className={styles.overlay}>
            <div className={styles.modal} dir="rtl">
              <div className={styles.modalHeader}>
                <h2>
                  {isEditMode ? "تعديل قائد أسرة" : "إنشاء قائد جديد"}
                </h2>
                <button
                  className={styles.closeBtn}
                  onClick={handleCloseModal}
                  aria-label="إغلاق"
                >
                  ×
                </button>
              </div>

              <p className={styles.modalSubtitle}>
                إضافة قائد أسرة جديد مع إذن طلب إنشاء أسرة
              </p>

              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label>الاسم</label>
                  <input
                    name="name"
                    type="text"
                    placeholder="أدخل الاسم الكامل"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>الرقم الجامعي</label>
                  <input
                    name="universityId"
                    type="text"
                    placeholder="أدخل الرقم الجامعي"
                    value={formData.universityId}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>الرقم القومي</label>
                  <input
                    name="nationalId"
                    type="text"
                    placeholder="أدخل الرقم القومي المكوّن من 14 رقم"
                    value={formData.nationalId}
                    onChange={handleChange}
                    maxLength={14}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>الهاتف</label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="أدخل رقم الهاتف"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>البريد الإلكتروني</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="أدخل عنوان البريد الإلكتروني"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>الدور</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="أخ أكبر / قائد">أخ أكبر / قائد</option>
                    <option value="أخت كبرى / مساعد">
                      أخت كبرى / مساعد
                    </option>
                  </select>
                </div>

                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={handleCloseModal}
                  >
                    إلغاء
                  </button>
                  <button type="submit" className={styles.btnPrimary}>
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
