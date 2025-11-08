"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./RequestDetails.module.css";


export default function RequestDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [status, setStatus] = useState("pending");
  const [notification, setNotification] = useState<string | null>(null);

  const [discounts, setDiscounts] = useState({
    books: false,
    enrollment: false,
    regular: false,
    full: false,
  });

  const baseAmount = 1500;

  const calculateDiscount = () => {
    if (discounts.full) return baseAmount;
    let discountValue = 0;
    if (discounts.books) discountValue += baseAmount * 0.1;
    if (discounts.enrollment) discountValue += baseAmount * 0.2;
    if (discounts.regular) discountValue += baseAmount * 0.5;
    return discountValue;
  };

  const handleDiscountChange = (type: string) => {
    setDiscounts((prev) => {
      const updated = { ...prev, [type]: !prev[type] };

      if (type === "full" && !prev.full) {
        return { books: false, enrollment: false, regular: false, full: true };
      }
      if (type === "full" && prev.full) {
        return { books: false, enrollment: false, regular: false, full: false };
      }

      return updated;
    });
  };

  const showNotification = (message: string, type: "success" | "warning" | "error") => {
    setNotification(`${type}:${message}`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleInitialApprove = () => {
    setStatus("received");
    showNotification("تمت الموافقة المبدئية بنجاح", "warning");
  };

  const handleFinalApprove = () => {
    setStatus("final");
    showNotification("تم قبول الطلب بنجاح", "success");
  };

  const handleReject = () => {
    setStatus("rejected");
    showNotification("تم رفض الطلب", "error");
  };

  return (
    <div className={styles.container}>
      {/* 🔔 إشعار ثابت فوق اليمين */}
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

      <h2 className={styles.pageTitle}>تفاصيل الطالب - أحمد محمد علي</h2>

      {/* الأقسام */}
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

      <section className={styles.section}>
        <h3>معلومات طلب الدعم</h3>
        <div className={styles.infoGrid}>
          <p><strong>الخصم:</strong> {calculateDiscount()} جنيه</p>
          <p><strong>تاريخ التقديم:</strong> ١٥‏/١‏/٢٠٢٤</p>
        </div>
        <p className={styles.longText}>
          <strong>الظروف المالية والاجتماعية:</strong> وفاة والدي العام الماضي جعل الأسرة تواجه صعوبات مالية كبيرة. 
          والدتي لا تعمل وتعتني بإخوتي الصغار. أحتاج الدعم المالي لمتابعة دراستي وعدم الانقطاع عن الجامعة.
        </p>
      </section>

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
{/* ✅ خصومات مع Dropdown لكل نوع خصم */}
<section className={styles.section}>
  <h3>الخصومات المتاحة</h3>
  <div className={styles.discountsBox}>
    {/* خصم مصاريف الكتب */}
    <div className={styles.discountSelect}>
      <label>خصم مصاريف الكتب:</label>
      <select
        value={discounts.books}
        onChange={(e) => setDiscounts({ ...discounts, books: e.target.value })}
      >
        <option value="none">لا يوجد</option>
        <option value="200">200</option>
        <option value="300">300</option>
        <option value="400">400</option>
        <option value="500">500</option>
        <option value="700">700</option>
      </select>
    </div>

    {/* خصم مصاريف الانتساب */}
    <div className={styles.discountSelect}>
      <label>خصم مصاريف الانتساب:</label>
      <select
        value={discounts.enrollment}
        onChange={(e) => setDiscounts({ ...discounts, enrollment: e.target.value })}
      >
        <option value="none">لا يوجد</option>
        <option value="200">100</option>
        <option value="300">300</option>
        <option value="400">400</option>
        <option value="500">500</option>
        <option value="700">700</option>
      </select>
    </div>

    {/* خصم مصاريف الانتظام */}
    <div className={styles.discountSelect}>
      <label>خصم مصاريف الانتظام:</label>
      <select
        value={discounts.regular}
        onChange={(e) => setDiscounts({ ...discounts, regular: e.target.value })}
      >
        <option value="none">لا يوجد</option>
        <option value="200">200</option>
        <option value="300">300</option>
        <option value="400">400</option>
        <option value="500">500</option>
        <option value="700">700</option>
      </select>
    </div>

    {/* خصم المصاريف كاملة */}
    <div className={styles.discountSelect}>
      <label>خصم المصاريف كاملة:</label>
      <select
        value={discounts.full}
        onChange={(e) => setDiscounts({ ...discounts, full: e.target.value })}
      >
        <option value="none">لا يوجد</option>
        <option value="200">200</option>
        <option value="300">300</option>
        <option value="400">400</option>
        <option value="500">500</option>
        <option value="700">700</option>
      </select>
    </div>
  </div>
</section>


      {/* ✅ الأزرار */}
      <div className={styles.actions}>
        {status === "pending" && <button onClick={handleInitialApprove} className={styles.btnApprove}>موافقة مبدئية</button>}
        {status === "received" && <button onClick={handleFinalApprove} className={styles.btnApprove}>قبول</button>}
        {status !== "final" && status !== "rejected" && <button onClick={handleReject} className={styles.btnReject}>رفض</button>}
      </div>

      {status === "final" && <div className={styles.btnReceived}>✅ تم اعتماد الطلب نهائيًا</div>}

      {/* 🔙 زر الرجوع تحت الموافقة */}
      <div className={styles.backContainer}>
        <button onClick={() => router.back()} className={styles.btnBack}>
         رجوع
        </button>
      </div>
    </div>
  );
}
