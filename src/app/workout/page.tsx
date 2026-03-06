'use client';

import { Suspense } from 'react';
import WorkoutContent from './_components/WorkoutContent/WorkoutContent';
import WorkoutFallback from './_components/WorkoutFallback/WorkoutFallback';

export default function WorkoutPage() {
  return (
    <Suspense fallback={<WorkoutFallback />}>
      <WorkoutContent />
    </Suspense>
  );
}
