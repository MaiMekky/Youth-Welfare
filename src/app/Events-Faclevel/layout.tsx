import React from "react";
import "./global.css";
import Sidebar from "./components/sidebar";


export const metadata = {
  title: "إدارة الأنشطة",
  description: "نظام إدارة طلبات الأنشطة لجامعة حلوان",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar">
      <body className="app-body">
        <div className="app-container">
         
          <Sidebar />

        
          <div className="main-content">
            <div className="page-wrapper">
              {children}
            </div>
          
          </div>
        </div>
      </body>
    </html>
  );
}
