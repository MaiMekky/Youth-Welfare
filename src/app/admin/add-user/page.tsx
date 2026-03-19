import { Suspense } from 'react';
import AddUserClient from './client';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 32, textAlign: "center" }}>جاري التحميل...</div>}>
      <AddUserClient />
    </Suspense>
  );
}