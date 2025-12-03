"use client";
import React from "react";
import "../styles/Activities.css";
import { Calendar, Users, Briefcase } from "lucide-react";

interface Activity {
  id: number;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  description: string;
  participants: string;
  status: "قادمة" | "مكتملة";
  color: string;
}

interface ActivitiesProps {
  activities: Activity[];
}

const Activities: React.FC<ActivitiesProps> = ({ activities }) => {
  return (
    <div className="activities-wrapper">
      <div className="activities-grid">
        {activities.map((act) => (
          <div key={act.id} className="activity-card">
            <div className="activity-header">
              <span
                className={`activity-status ${
                  act.status === "قادمة" ? "status-upcoming" : "status-done"
                }`}
              >
                {act.status}
              </span>

              <div
                className="activity-type-icon"
                style={{ backgroundColor: act.color }}
              >
                {act.type.includes("اجتماع") ? (
                  <Users size={18} color="#fff" />
                ) : act.type.includes("مسابقة") ? (
                  <Calendar size={18} color="#fff" />
                ) : (
                  <Briefcase size={18} color="#fff" />
                )}
              </div>
            </div>

            <h3 className="activity-title">{act.title}</h3>
            <p className="activity-desc">{act.description}</p>

            <div className="activity-info">
              <div className="info-item">
                <Calendar size={16} />
                {act.date} - {act.time}
              </div>

              <div className="info-item">
                <Users size={16} />
                {act.location}
              </div>

              <div className="info-item">
                <Briefcase size={16} />
                {act.participants}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Activities;
