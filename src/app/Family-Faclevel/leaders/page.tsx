import React from "react";
import FamilyLeaders from "./components/familyLeaders";
import Header from "@/app/FacLevel/components/Header";
import Footer from "@/app/FacLevel/components/Footer";
import styles from "./styles/familyLeaders.module.css";

const Page: React.FC = () => {
  return (
    <div className={styles.pageWrapper}>
      <Header />
      <FamilyLeaders />
      <Footer />
    </div>
  );
};

export default Page;
