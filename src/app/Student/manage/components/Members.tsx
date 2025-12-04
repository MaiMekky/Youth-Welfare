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
  members?: Member[];
}

// Dummy data
const dummyMembers: Member[] = [
  {
    id: 1,
    name: "أحمد محمد علي",
    college: "كلية الهندسة",
    joinedAt: "2024-01-15",
    lastActive: "منذ ساعتين",
    role: "مؤسس",
    isOnline: true,
  },
  {
    id: 2,
    name: "فاطمة أحمد حسن",
    college: "كلية العلوم",
    joinedAt: "2024-02-20",
    lastActive: "منذ يوم",
    role: "مساعد",
    isOnline: false,
  },
  {
    id: 3,
    name: "محمود خالد سعيد",
    college: "كلية الحاسبات والمعلومات",
    joinedAt: "2024-03-10",
    lastActive: "منذ 5 دقائق",
    role: "عضو",
    isOnline: true,
  },
  {
    id: 4,
    name: "سارة عبدالله إبراهيم",
    college: "كلية الهندسة",
    joinedAt: "2024-03-15",
    lastActive: "منذ 30 دقيقة",
    role: "مساعد",
    isOnline: true,
  },
  {
    id: 5,
    name: "محمد حسن علي",
    college: "كلية التجارة",
    joinedAt: "2024-04-01",
    lastActive: "منذ 3 ساعات",
    role: "عضو",
    isOnline: false,
  },
  {
    id: 6,
    name: "نور الدين يوسف",
    college: "كلية الطب",
    joinedAt: "2024-04-10",
    lastActive: "منذ يومين",
    role: "عضو",
    isOnline: false,
  },
  {
    id: 7,
    name: "ليلى محمود أحمد",
    college: "كلية الصيدلة",
    joinedAt: "2024-05-05",
    lastActive: "منذ ساعة",
    role: "عضو",
    isOnline: true,
  },
  {
    id: 8,
    name: "عمر سامي حسين",
    college: "كلية الهندسة",
    joinedAt: "2024-05-20",
    lastActive: "الآن",
    role: "عضو",
    isOnline: true,
  },
];

const Members: React.FC<MembersProps> = ({ members }) => {
  // Use passed members or fall back to dummy data
  const displayMembers = members && members.length > 0 ? members : dummyMembers;

  return (
    <div className="members-wrapper">
      <div className="members-grid">
        {displayMembers.map((m) => (
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