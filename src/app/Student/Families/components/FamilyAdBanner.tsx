"use client";
import React, { useState, useEffect } from "react";
import styles from "../styles/FamilyAdBanner.module.css";

interface FamilyAdBannerProps {
    onLearnMore: () => void;
}

const FamilyAdBanner: React.FC<FamilyAdBannerProps> = ({ onLearnMore }) => {
    const [mounted, setMounted] = useState(false);

    // Ensure component is mounted before rendering to prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch by waiting for client-side mount
    if (!mounted) {
        return null;
    }

    return (
        <div className={styles.bannerContainer}>
            <div className={styles.bannerCard}>
                {/* Decorative glow orb */}
                <div className={styles.bannerGlow} aria-hidden="true" />

                {/* Icon */}
                <div className={styles.bannerIcon}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                </div>

                {/* Text content */}
                <div className={styles.bannerContent}>
                    <h2 className={styles.bannerTitle}>تعرف على أهم الشروط لتكوين أسرتك</h2>
                    <p className={styles.bannerDescription}>
                        اكتشف متطلبات إنشاء أسرة طلابية جديدة والخطوات اللازمة للانضمام إلى مجتمعنا الطلابي النشط
                    </p>
                </div>

                {/* CTA Button */}
                <button className={styles.bannerButton} onClick={onLearnMore}>
                    <span>تعرف على المزيد</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={styles.arrowIcon}
                    >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default FamilyAdBanner;