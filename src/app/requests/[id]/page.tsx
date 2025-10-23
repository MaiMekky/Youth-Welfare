"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./RequestDetails.module.css";

export default function RequestDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [status, setStatus] = useState("pending");

  // ✅ الخصومات
  const [discounts, setDiscounts] = useState({
    books: false,
    enrollment: false,
    regular: false,
    full: false,
  });

  const baseAmount = 1500;

  // 🧮 حساب المبلغ بعد الخصم
  const calculateDiscount = () => {
    if (discounts.full) return 0;
    let discountValue = 0;
    if (discounts.books) discountValue += baseAmount * 0.1;
    if (discounts.enrollment) discountValue += baseAmount * 0.2;
    if (discounts.regular) discountValue += baseAmount * 0.3;
    return Math.max(baseAmount - discountValue, 0);
  };

  const handleDiscountChange = (type: string) => {
    setDiscounts((prev) => {
      const updated = { ...prev, [type]: !prev[type] };

      // لو اختار خصم كامل → يلغي الباقي
      if (type === "full" && !prev.full) {
        return { books: false, enrollment: false, regular: false, full: true };
      }

      // لو شال خصم كامل → يرجّعهم فاضيين
      if (type === "full" && prev.full) {
        return { books: false, enrollment: false, regular: false, full: false };
      }

      return updated;
    });
  };

  const handleInitialApprove = () => setStatus("received");
  const handleFinalApprove = () => setStatus("final");
  const handleReject = () => setStatus("rejected");

  return (
    <div className={styles.container}>
      <h2 className={styles.pageTitle}>تفاصيل الطالب - أحمد محمد علي</h2>

      {/* 🟨 المعلومات الشخصية */}
      <section className={styles.section}>
        <h3>المعلومات الشخصية</h3>
        <div className={styles.infoGrid}>
          <p><strong>الاسم الكامل:</strong> أحمد محمد علي</p>
          <p><strong>الرقم القومي:</strong> 29912345678901</p>
          <p><strong>رقم الطالب:</strong> ST-ENG-001</p>
          <p><strong>الكلية:</strong> كلية الهندسة</p>
          <p><strong>السنة الدراسية:</strong> السنة الثالثة</p>
          <p><strong>المعدل التراكمي:</strong> 3.45</p>
          <p><strong>رقم الهاتف:</strong> 01234567890</p>
          <p><strong>البريد الإلكتروني:</strong> ahmed.mohamed@university.edu</p>
        </div>
      </section>

      {/* 🟩 معلومات الأسرة */}
      <section className={styles.section}>
        <h3>معلومات الأسرة</h3>
        <div className={styles.infoGrid}>
          <p><strong>حالة الأب:</strong> متوفى</p>
          <p><strong>حالة الأم:</strong> على قيد الحياة</p>
          <p><strong>الدخل الشهري:</strong> 2500 جنيه</p>
          <p><strong>عدد أفراد الأسرة:</strong> 5</p>
          <p><strong>إخوة في الجامعة:</strong> نعم</p>
          <p><strong>عدد الإخوة:</strong> 2</p>
          <p><strong>حالة السكن:</strong> أسكن مع العائلة</p>
          <p><strong>العنوان:</strong> شارع النيل، حي المعادي، محافظة القاهرة</p>
        </div>
      </section>

      {/* 🟦 معلومات طلب الدعم */}
      <section className={styles.section}>
        <h3>معلومات طلب الدعم</h3>
        <div className={styles.infoGrid}>
          <p><strong>المبلغ المطلوب:</strong> {baseAmount} جنيه</p>
          <p><strong>المبلغ بعد الخصم:</strong> {calculateDiscount()} جنيه</p>
          <p><strong>تاريخ التقديم:</strong> ١٥‏/١‏/٢٠٢٤</p>
        </div>
        <p className={styles.longText}>
          <strong>الظروف المالية والاجتماعية:</strong> وفاة والدي العام الماضي جعل الأسرة تواجه صعوبات مالية كبيرة. 
          والدتي لا تعمل وتعتني بإخوتي الصغار. أحتاج الدعم المالي لمتابعة دراستي وعدم الانقطاع عن الجامعة.
        </p>
      </section>

      {/* 🟨 المستندات المطلوبة */}
      <section className={styles.section}>
        <h3>المستندات المطلوبة</h3>
        <table className={styles.docsTable}>
          <thead>
            <tr>
              <th>اسم المستند</th>
              <th>الحالة</th>
              <th>المراجعة</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>بحث اجتماعي من وحدة التكافل الاجتماعي</td>
              <td>مطلوب</td>
              <td className={styles.verified}>تم التحقق</td>
            </tr>
            <tr>
              <td>مفردات المرتب أو المعاش أو ما يفيد بالدخل</td>
              <td>مطلوب</td>
              <td className={styles.pending}>في الانتظار</td>
            </tr>
            <tr>
              <td>صورة البطاقة الشخصية للوالد (أو ولي الأمر)</td>
              <td>مطلوب</td>
              <td className={styles.verified}>تم التحقق</td>
            </tr>
            <tr>
              <td>صورة البطاقة الشخصية للطالب</td>
              <td>مطلوب</td>
              <td className={styles.verified}>تم التحقق</td>
            </tr>
            <tr>
              <td>حيازة زراعية لسكان الأقاليم</td>
              <td>اختياري</td>
              <td className={styles.missing}>مفقود</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 🟧 ملاحظة */}
      <section className={styles.sectionNote}>
        <strong>ملاحظة هامة:</strong> جميع المستندات المطلوبة يجب أن تكون أصلية أو صور طبق الأصل معتمدة.
        المستندات الناقصة أو غير الصحيحة قد تؤدي إلى تأخير أو رفض الطلب.
      </section>

      {/* ✅ صندوق الخصومات */}
      <div className={styles.discountsBox}>
        <label>
          <input
            type="checkbox"
            checked={discounts.books}
            onChange={() => handleDiscountChange("books")}
          />
          خصم مصاريف الكتب (10%)
        </label>
        <label>
          <input
            type="checkbox"
            checked={discounts.enrollment}
            onChange={() => handleDiscountChange("enrollment")}
          />
          خصم مصاريف الانتساب (20%)
        </label>
        <label>
          <input
            type="checkbox"
            checked={discounts.regular}
            onChange={() => handleDiscountChange("regular")}
          />
          خصم مصاريف الانتظام (30%)
        </label>
        <label>
          <input
            type="checkbox"
            checked={discounts.full}
            onChange={() => handleDiscountChange("full")}
          />
          خصم المصاريف كاملة (100%)
        </label>
      </div>

      {/* 🟩 الأزرار */}
      <div className={styles.actions}>
        {status === "pending" && (
          <button onClick={handleInitialApprove} className={styles.btnApprove}>
            موافقة مبدئية
          </button>
        )}
        {status === "received" && (
          <button onClick={handleFinalApprove} className={styles.btnApprove}>
            موافقة نهائية
          </button>
        )}
        {status !== "final" && status !== "rejected" && (
          <button onClick={handleReject} className={styles.btnReject}>
            رفض
          </button>
        )}
      </div>

      {status === "final" && (
        <div className={styles.btnReceived}>✅ تم اعتماد الطلب نهائيًا</div>
      )}

      <button onClick={() => router.back()} className={styles.btnBack}>
        رجوع
      </button>
    </div>
  );
}
