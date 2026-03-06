'use client';

import { Suspense } from 'react';
import PreviewContent from './_components/PreviewContent/PreviewContent';
import PreviewFallback from './_components/PreviewFallback/PreviewFallback';

export default function PreviewPage() {
  return (
    <Suspense fallback={<PreviewFallback />}>
      <PreviewContent />
    </Suspense>
  );
}
