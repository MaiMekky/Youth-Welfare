"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logo from "../assets/logo1.png";
import styles from "../Styles/components/LoginPage.module.css";
interface LoginPageProps {
  onClose: () => void;
  onSwitchToSignup: () => void;
}

export default function LoginPage({ onClose, onSwitchToSignup }: LoginPageProps) {
  let router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  router = useRouter();

  // ======= Validation =======
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = "البريد مطلوب";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "البريد غير صالح";

    if (!password.trim()) newErrors.password = "كلمة المرور مطلوبة";
    // else if (password.length < 6) newErrors.password = "كلمة المرور قصيرة جدًا";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  router = useRouter();
  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validate()) return;
  setLoading(true);

  try {
    const res = await fetch("http://localhost:8000/api/auth/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "فشل تسجيل الدخول");
      setLoading(false);
      return;
    }

    // data = { token: "JWT_TOKEN", role: "super_admin" }


    
    console.log(data)
    // حفظ التوكن في localStorage
     localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    // localStorage.setItem('user_type', data.user_type);
    localStorage.setItem("user", JSON.stringify({
  name:data.name,
  role: data.role,
  faculty_name: data.faculty_name,
  admin_id:data.admin_id,
  user_type:data.user_type
}));
    if (data.user_type === "student") {
      localStorage.setItem('student_id', data.student_id.toString());
     }else { 
      localStorage.setItem('admin_id', data.admin_id.toString());
     }
    localStorage.setItem('role', data.role);
    localStorage.setItem('name', data.name);

    console.log("bruh")
  // توجيه حسب الدور
   if (data.user_type === "admin") {
      if (data.role === "مشرف النظام") {
        console.log("after")
        router.push("/SuperAdmin");
      } else if(data.role === "مدير ادارة") { 
        router.push("/uni-level");
      }
      else if(data.role === "مسؤول كلية") { 
        router.push("/FacLevel");
      }
    }
    else if (data.user_type === "student") {
      router.push("/Student");
    }

     console.log("after erelksdjfowei")
    //  else if (data.role === "مدير ادارة") {
    //   router.push("/");
    //  }
    
  } catch (error) {
    console.error(error);
    alert("حدث خطأ أثناء تسجيل الدخول");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className={styles.loginBox}>
      {/* Close Button */}
      <button className={styles.closeBtn} onClick={onClose}>
        ✕
      </button>

      {/* Logo */}
      <div className={styles.logoContainer}>
        <Image src={logo} alt="Logo" width={150} height={150} draggable ={false} />
      </div>

      <h2 className={styles.loginTitle}>تسجيل الدخول</h2>

      {/* Form */}
      <form onSubmit={handleLogin} className={styles.loginForm}>
        <input
          type="text"
          placeholder="البريد الجامعي"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={errors.email ? styles.invalid : ""}
        />
        {errors.email && <p className={styles.errorMsg}>{errors.email}</p>}

        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={errors.password ? styles.invalid : ""}
        />
        {errors.password && <p className={styles.errorMsg}>{errors.password}</p>}

        {errors.general && <p className={styles.errorMsg}>{errors.general}</p>}

        <button type="submit" disabled={loading} className={styles.loginButton}>
          {loading ? "جاري التحقق..." : "تسجيل الدخول"}
        </button>
      </form>

      {/* Signup Link */}

      <p className={styles.signupText}>
        ليس لديك حساب؟{" "}
        <span className={styles.linkSwitch} onClick={onSwitchToSignup}>
          إنشاء حساب جديد
        </span>
      </p>
    </div>
  );
}
