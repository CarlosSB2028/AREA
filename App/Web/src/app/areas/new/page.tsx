'use client';

import { useSearchParams } from 'next/navigation';
import AreaEditor from '../../../components/ui/areaCreation/AreaEditor';
import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/services/authService';

function NewAreaContent() {
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draft') || undefined;
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          await router.replace('/login');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        await router.replace('/login');
      }
    };
    checkLogin();
  }, [router]);
  
  return <AreaEditor draftId={draftId} />;
}

export default function NewAreaPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewAreaContent />
    </Suspense>
  );
}