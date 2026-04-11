'use client';

import { useParams, useRouter } from 'next/navigation';
import LessonWizard from '../../_components/lesson-wizard';

/* ------------------------------------------------------------------ */
/*  Edit Lesson — Figma screens-v2 / admin-edit-lesson                 */
/* ------------------------------------------------------------------ */

export default function EditLessonPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  if (!id) return null;

  return (
    <LessonWizard
      mode="edit"
      lessonId={id}
      label="LESSONS > EDIT LESSON"
      title="Edit Lesson Details"
      primaryCta="Update Lesson"
      onCancel={() => router.back()}
      onDone={() => router.push('/admin/lessons')}
    />
  );
}
