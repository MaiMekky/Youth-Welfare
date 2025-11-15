import { NextResponse } from "next/server";
import type { StatItem } from "../../types/stats";

export async function GET() {
  // Simulate real data fetch, maybe from DB or external service
  const data: StatItem[] = [
    { value: "25+", label: "كلية" },
    { value: "50+", label: "نادي طلابي" },
    { value: "200+", label: "نشاط سنوي" },
    { value: "15,000+", label: "طالب مشارك" },
  ];
  
  return NextResponse.json(data);
}