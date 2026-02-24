import React from 'react';

const StaticCard: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: '#27285D',
        borderRadius: '16px',
        padding: '48px 24px',
        textAlign: 'center',
        maxWidth: '1120px',
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}
    >
      <h2
        style={{
          color: '#F3F5FD',
          fontSize: 'clamp(24px, 5vw, 36px)',
          fontWeight: '700',
          marginBottom: '16px',
          lineHeight: '1.4',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        جميع الأنشطة والفعاليات
      </h2>
      
      <p
        style={{
          color: '#F3F5FD',
          fontSize: 'clamp(14px, 3vw, 18px)',
          fontWeight: '400',
          lineHeight: '1.6',
          margin: '0',
          opacity: '0.9',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        استكشف مجموعة متنوعة من الأنشطة والفعاليات المتاحة للطلاب في جامعة حلوان
      </p>
      
      <div
        style={{
          width: '80px',
          height: '4px',
          backgroundColor: '#B38E19',
          margin: '24px auto 0',
          borderRadius: '2px',
        }}
      />
    </div>
  );
};

export default StaticCard;