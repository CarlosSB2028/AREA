'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import AreaEditor from '../../../components/ui/areaCreation/AreaEditor';
import { getCurrentUser } from '@/services/authService';
import { useEffect } from 'react';
import { getAreaById } from '@/services/areasService';

export default function EditAreaPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const areaId = params.id as string;
  const draftId = searchParams.get('draft') || undefined;
  const mode = searchParams.get('mode');

  useEffect(() => {
    const checkLogin = async () => {
      let user;
      try {
        user = await getCurrentUser();
        if (!user) {
          router.push('/');
          return;
        }
      } catch (error) {
        console.error('Error getting current user:', error);
        router.push('/');
        return;
      }
      try {
        const area = await getAreaById(areaId);
        if (area) {
          if (area.userId !== user.id) {
            router.push('/areas');
            return;
          }
        } else {
          router.push('/areas');
          return;
        }
      } catch (error) {
        console.error('Error getting area by ID:', error);
        router.push('/areas');
        return;
      }

      if (!mode) {
        router.push(`/areas/${areaId}/edit-simple`);
      }
    };
    checkLogin();
  }, [router, areaId, mode]);

  if (mode !== 'advanced') {
    return null;
  }

  return <AreaEditor areaId={areaId} draftId={draftId} />;
}