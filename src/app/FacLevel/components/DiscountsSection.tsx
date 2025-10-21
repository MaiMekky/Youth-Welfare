"use client";
import React, { useState } from "react";
import styles from "../Styles/DiscountsSection.module.css";

export default function DiscountsSection() {
  const [isEditing, setIsEditing] = useState(false);
  const [discounts, setDiscounts] = useState({
    books: "20%",
    distant: "30%",
    regular: "25%",
    full: "50%",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDiscounts({ ...discounts, [name]: value });
  };

  const handleSave = () => {
    setIsEditing(false);
    console.log("✅ Saved:", discounts);
  };

  return (
    <div className={styles.container}>
      <div className={styles.cards}>
        <div className={styles.card}>
          <h4>خصم مصاريف الكتب</h4>
          {isEditing ? (
            <input
              type="text"
              name="books"
              value={discounts.books}
              onChange={handleChange}
            />
          ) : (
            <p>{discounts.books}</p>
          )}
        </div>

        <div className={styles.card}>
          <h4>خصم مصاريف انتساب</h4>
          {isEditing ? (
            <input
              type="text"
              name="distant"
              value={discounts.distant}
              onChange={handleChange}
            />
          ) : (
            <p>{discounts.distant}</p>
          )}
        </div>

        <div className={styles.card}>
          <h4>خصم مصاريف انتظام</h4>
          {isEditing ? (
            <input
              type="text"
              name="regular"
              value={discounts.regular}
              onChange={handleChange}
            />
          ) : (
            <p>{discounts.regular}</p>
          )}
        </div>

        <div className={styles.card}>
          <h4>خصم المصاريف الكاملة</h4>
          {isEditing ? (
            <input
              type="text"
              name="full"
              value={discounts.full}
              onChange={handleChange}
            />
          ) : (
            <p>{discounts.full}</p>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        {isEditing ? (
          <button className={styles.saveBtn} onClick={handleSave}>
            حفظ
          </button>
        ) : (
          <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
            تعديل
          </button>
        )}
      </div>
    </div>
  );
}
