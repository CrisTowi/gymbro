'use client';

import { type ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';

export default function SortableRow({
  id,
  children,
}: {
  id: string;
  children: (props: {
    setNodeRef: (node: HTMLElement | null) => void;
    setActivatorNodeRef: (node: HTMLElement | null) => void;
    listeners: Record<string, unknown> | undefined;
    transform: { x: number; y: number; scaleX: number; scaleY: number } | null;
    transition: string | undefined;
    isDragging: boolean;
  }) => ReactNode;
}) {
  const { setNodeRef, setActivatorNodeRef, listeners, transform, transition, isDragging } =
    useSortable({ id });
  return (
    <>
      {children({ setNodeRef, setActivatorNodeRef, listeners, transform, transition, isDragging })}
    </>
  );
}
