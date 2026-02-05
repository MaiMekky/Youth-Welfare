"use client";
import React, { useState } from 'react';
import styles from "../Styles/components/Services.module.css";

interface ServiceItem {
  icon: string;
  title: string;
  description: string;
  id: number;
}

const Services: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const servicesData: ServiceItem[] = [
    { icon: "🔍", title: "الاستعلامات", description: "استعلم عن جميع الخدمات", id: 1 },
    { icon: "📖", title: "دليل الطالب", description: "دليل شامل للخدمات", id: 2 },
    { icon: "💬", title: "الدعم الطلابي", description: "خدمات الدعم والإرشاد", id: 3 },
    { icon: "📝", title: "تسجيل الأنشطة", description: "سجل في الأنشطة بسهولة", id: 4 },
    { icon: "📅", title: "التقويم الأكاديمي", description: "تصفح مواعيد الأنشطة", id: 5 },
    { icon: "✈️", title: "المنح والبعثات", description: "معلومات عن الفرص المتاحة", id: 6 },
  ];


  const serviceCardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    padding: '2rem 1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    cursor: 'pointer',
    border: '2px solid transparent',
  };

  const serviceCardHoverStyle: React.CSSProperties = {
    ...serviceCardStyle,
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 25px rgba(0, 0, 0, 0.15)',
    border: '2px solid #ffffff',
  };

  const iconStyle: React.CSSProperties = {
    fontSize: '3rem',
    marginBottom: '1rem',
    transition: 'transform 0.3s ease',
  };

  const iconHoverStyle: React.CSSProperties = {
    ...iconStyle,
    transform: 'scale(1.1)',
  };

  const titleCardStyle: React.CSSProperties = {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '0.8rem',
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '0.95rem',
    color: '#7f8c8d',
    lineHeight: '1.5',
  };

  const handleCardClick = (serviceId: number) => {
    // This will be handled by routing later
    console.log(`Navigating to service: ${serviceId}`);
    // You can replace this with your routing logic
    // router.push(`/services/${serviceId}`);
  };

  return (
    <div className={styles.servicesContainer}>
      <div className={styles.servicesHeader}>
        <h1 className={styles.servicesTitle}>الخدمات السريعة</h1>
        <p className={styles.servicesSubtitle}>
          وصول سريع لأهم الخدمات الطلابية
        </p>
      </div>

      <div className={styles.servicesGrid}>
        {servicesData.map((service) => (
          <div
            key={service.id}
            style={
              hoveredCard === service.id ? serviceCardHoverStyle : serviceCardStyle
            }
            onMouseEnter={() => setHoveredCard(service.id)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleCardClick(service.id)}
          >
            <div 
              style={
                hoveredCard === service.id ? iconHoverStyle : iconStyle
              }
            >
              {service.icon}
            </div>
            <h3 style={titleCardStyle}>{service.title}</h3>
            <p style={descriptionStyle}>{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;