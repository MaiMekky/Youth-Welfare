"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type Language = "ar" | "en";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  ar: {
    youthCare: "الإدارة العامة لرعاية الشباب",
    youthCareEn: "Helwan University - Youth Care",
    searchPlaceholder: "البحث في الموقع...",
    english: "English",
    arabic: "العربية",
    studentPortal: "بوابة الطلاب",
    helwanUniversity: "جامعة حلوان",
    welcomeMessage: "مرحباً بكم في بوابة رعاية الشباب",
    heroDescription:
      "بوابتكم إلى عالم من الفرص والإبداع في بيئة جامعية متميزة تساهم في إعداد جيل من الشباب القادر على مواجهة تحديات المستقبل",
    exploreActivities: "استكشف الأنشطة",
    login: "تسجيل الدخول",
    contactUs: "تواصل معنا",
    registerNow: "سجل الآن",
    registeredStudents: "طالب مسجل",
    annualEvents: "فعالية سنوية",
    diverseSpecialized: "متنوعة ومتخصصة",
    awardsRecognition: "جائزة وتكريم",
    excellentStudents: "للطلاب المتميزين",
    studentClubs: "نادي طلابي",
    variousFields: "في مختلف المجالات",
    latestNews: "آخر الأخبار والإعلانات",
    followLatest: "تابع أحدث الأخبار والفعاليات في جامعة حلوان",
    viewAllNews: "عرض جميع الأخبار",
    universityStats: "إحصائيات الجامعة",
    statsDescription: "أرقام تعكس نشاط وحيوية مجتمعنا الجامعي",
    quickServices: "الخدمات السريعة",
    quickAccess: "وصول سريع لأهم الخدمات الطلابية",
    activityGallery: "معرض صور الأنشطة",
    memorableMoments: "لحظات مميزة من فعاليات وأنشطة الجامعة",
    visionMission: "رؤيتنا ورسالتنا",
    ourVision: "رؤيتنا",
    visionText:
      "أن نكون الجهة الرائدة في رعاية الشباب الجامعي وتنمية قدراتهم ومهاراتهم ليكونوا قادة المستقبل.",
    ourMission: "رسالتنا",
    missionText:
      "توفير برامج وأنشطة متميزة تساهم في الارتقاء بالمستوى الثقافي والعلمي والرياضي للطلاب.",
    joinUsToday: "انضم إلينا اليوم",
    startJourney:
      "ابدأ رحلتك معنا واكتشف الفرص اللامحدودة للنمو والتطور في بيئة جامعية محفزة ومبدعة.",
    welcomeDescription:
      "نحن ملتزمون بتوفير بيئة تعليمية وثقافية متميزة تساهم في إعداد جيل من الشباب القادر على مواجهة تحديات المستقبل. من خلال برامجنا المتنوعة والأنشطة المبتكرة، نسعى لتنمية قدرات الطلاب وصقل مواهبهم في جميع المجالات.",
  },

  en: {
    youthCare: "General Administration for Youth Care",
    youthCareEn: "Helwan University - Youth Care",
    searchPlaceholder: "Search the website...",
    english: "English",
    arabic: "العربية",
    studentPortal: "Student Portal",
    helwanUniversity: "Helwan University",
    welcomeMessage: "Welcome to the Youth Care Portal",
    heroDescription:
      "Your gateway to a world of opportunities and creativity in a distinguished university environment that contributes to preparing a generation of youth capable of facing future challenges",
    exploreActivities: "Explore Activities",
    login: "Login",
    contactUs: "Contact Us",
    registerNow: "Register Now",
    registeredStudents: "Registered Students",
    annualEvents: "Annual Events",
    diverseSpecialized: "Diverse and Specialized",
    awardsRecognition: "Awards & Recognition",
    excellentStudents: "For Excellent Students",
    studentClubs: "Student Clubs",
    variousFields: "In Various Fields",
    latestNews: "Latest News & Announcements",
    followLatest: "Follow the latest news and events at Helwan University",
    viewAllNews: "View All News",
    universityStats: "University Statistics",
    statsDescription:
      "Numbers reflecting the activity and vitality of our university community",
    quickServices: "Quick Services",
    quickAccess: "Quick access to the most important student services",
    activityGallery: "Activity Photo Gallery",
    memorableMoments:
      "Memorable moments from university events and activities",
    visionMission: "Our Vision & Mission",
    ourVision: "Our Vision",
    visionText:
      "To be the leading entity in university youth care and developing their abilities and skills to become future leaders.",
    ourMission: "Our Mission",
    missionText:
      "Providing distinguished programs and activities that contribute to raising the cultural, scientific and sports level of students.",
    joinUsToday: "Join Us Today",
    startJourney:
      "Start your journey with us and discover unlimited opportunities for growth and development in an inspiring and creative university environment.",
    welcomeDescription:
      "We are committed to providing a distinguished educational and cultural environment that contributes to preparing a generation of youth capable of facing future challenges. Through our diverse programs and innovative activities, we strive to develop students' abilities and refine their talents in all fields.",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>("ar");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "ar" ? "en" : "ar"));
  };

  const t = (key: string): string => {
    return (
      translations[language][key as keyof (typeof translations)["ar"]] || key
    );
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
