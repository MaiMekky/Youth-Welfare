"use client";
import React from "react";
import "../styles/Members.css";
import { UserRound } from "lucide-react";

interface Member {
  id: number;
  name: string;
  college: string;
  joinedAt: string;
  lastActive: string;
  role: "عضو" | "مساعد" | "مؤسس";
  isOnline: boolean;
}

interface MembersProps {
  members: Member[];
}

const Members: React.FC<MembersProps> = ({ members }) => {
  return (
    <div className="members-wrapper">
      <div className="members-grid">
        {members.map((m) => (
          <div key={m.id} className="member-card">
            
            {/* Online Status */}
            <span
              className={`status-dot ${m.isOnline ? "online" : "offline"}`}
            ></span>

            {/* Name + Role */}
            <div className="member-header">
              <div className="member-name">{m.name}</div>
              <div className="member-role-icon">
                <UserRound size={20} color="#5a67d8" />
              </div>
            </div>

            {/* College */}
            <div className="member-college">{m.college}</div>

            {/* Joined + Last Active */}
            <div className="member-info">
              <p>انضم في: {m.joinedAt}</p>
              <p>آخر ظهور: {m.lastActive}</p>
            </div>

            {/* Role Tag */}
            <div
              className={`member-role-tag ${
                m.role === "مؤسس"
                  ? "founder"
                  : m.role === "مساعد"
                  ? "assistant"
                  : "member"
              }`}
            >
              {m.role}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Members;
