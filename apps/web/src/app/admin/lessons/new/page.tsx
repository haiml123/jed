'use client';

import { useRouter } from 'next/navigation';
import LessonWizard from '../_components/lesson-wizard';

/* ------------------------------------------------------------------ */
/*  Create New Lesson — Figma screens-v2 / admin-add-lesson            */
/* ------------------------------------------------------------------ */

export default function NewLessonPage() {
  const router = useRouter();
  return (
    <LessonWizard
      mode="create"
      label="LESSONS > NEW LESSON"
      title="Create New Lesson"
      primaryCta="Save Lesson"
      onCancel={() => router.back()}
      onDone={() => router.push('/admin/lessons')}
    />
  );
}
