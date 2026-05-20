import { Suspense } from "react";
import UniversityTeamPage from "./Universityteampage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <UniversityTeamPage />
    </Suspense>
  );
}