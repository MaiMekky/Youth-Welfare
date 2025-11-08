"use client";
import React, { useState } from "react";
import styles from "../Styles/DiscountsSection.module.css";

export default function DiscountsSection() {
  const [isEditing, setIsEditing] = useState(false);
  const [discounts, setDiscounts] = useState({
    books: ["200", "300", "400", "500", "700"],
    distant: ["200", "300", "400", "500", "700"],
    regular:["200", "300", "400", "500", "700"],
    full: ["200", "300", "400", "500", "700"],
  });

  const handleChange = (type: string, index: number, value: string) => {
    const updated = [...discounts[type as keyof typeof discounts]];
    updated[index] = value;
    setDiscounts({ ...discounts, [type]: updated });
  };

  const handleSave = () => {
    setIsEditing(false);
    console.log("✅ Saved:", discounts);
  };

  const renderInputs = (type: string) => {
    return discounts[type as keyof typeof discounts].map((val, idx) => (
      <input
        key={idx}
        type="text"
        value={val}
        onChange={(e) => handleChange(type, idx, e.target.value)}
        className={styles.discountInput}
      />
    ));
  };

  return (
    <div className={styles.container}>
      <div className={styles.cards}>
        <div className={styles.card}>
          <h4>خصم مصاريف الكتب</h4>
          {isEditing ? renderInputs("books") : discounts.books.map((d, i) => <p key={i}>{d}</p>)}
        </div>

        <div className={styles.card}>
          <h4>خصم مصاريف انتساب</h4>
          {isEditing ? renderInputs("distant") : discounts.distant.map((d, i) => <p key={i}>{d}</p>)}
        </div>

        <div className={styles.card}>
          <h4>خصم مصاريف انتظام</h4>
          {isEditing ? renderInputs("regular") : discounts.regular.map((d, i) => <p key={i}>{d}</p>)}
        </div>

        <div className={styles.card}>
          <h4>خصم المصاريف الكاملة</h4>
          {isEditing ? renderInputs("full") : discounts.full.map((d, i) => <p key={i}>{d}</p>)}
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

