import React from "react";
import "../Styles/components/Card.module.css";
import { StatItem } from "../types/stats";

const Card: React.FC<StatItem> = ({ value, label }) => {
  return (
    <div className="card">
      <h3 className="card-value">{value}</h3>
      <p className="card-label">{label}</p>
    </div>
  );
};

export default Card;
