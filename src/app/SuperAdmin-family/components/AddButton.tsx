
"use client";
import React from "react";
import styles from "../Styles/AddButton.module.css";
import { useRouter } from "next/navigation";


export default function AddButton() {
const router = useRouter();
return (
<button className={styles.btnAdd} onClick={() => router.push("/SuperAdmin-family/add-central-family")} >
+ إضافة أسرة مركزية
</button>
);
}