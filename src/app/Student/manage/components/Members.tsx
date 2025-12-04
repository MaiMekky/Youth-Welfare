"use client";
import React from "react";
import "../styles/Members.css";
import { UserRound } from "lucide-react";

interface Member {
  id: number;
  name: string;
  joinedAt: string;
  role: "عضو" | "مساعد" | "مؤسس";
  
}

interface MembersProps {
  members?: Member[];
}

// Dummy data
const dummyMembers: Member[] = [
  {
    id: 1,
    name: "أحمد محمد علي",
    joinedAt: "2024-01-15",
    role: "مؤسس",
   
  },
  {
    id: 2,
    name: "فاطمة أحمد حسن",
    joinedAt: "2024-02-20",
    role: "مساعد",
   
  },
  {
    id: 3,
    name: "محمود خالد سعيد",
    joinedAt: "2024-03-10",
    
    role: "عضو",
    
  },
  {
    id: 4,
    name: "سارة عبدالله إبراهيم",
    joinedAt: "2024-03-15",
   
    role: "مساعد",
    
  },
  {
    id: 5,
    name: "محمد حسن علي",
    joinedAt: "2024-04-01",
   
    role: "عضو",
    
  },
  {
    id: 6,
    name: "نور الدين يوسف",
    joinedAt: "2024-04-10",
    role: "عضو",
  
  },
  {
    id: 7,
    name: "ليلى محمود أحمد",
    joinedAt: "2024-05-05",
    role: "عضو",
    
  },
  {
    id: 8,
    name: "عمر سامي حسين",
    joinedAt: "2024-05-20",
    role: "عضو",
    
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
           

            {/* Name + Role */}
            <div className="member-header">
              <div className="member-name">{m.name}</div>
              <div className="member-role-icon">
                <UserRound size={20} color="#5a67d8" />
              </div>
            </div>

          
          
            <div className="member-info">
              <p>انضم في: {m.joinedAt}</p>
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