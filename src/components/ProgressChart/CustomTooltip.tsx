'use client';

import { lbsToKg } from '@/utils/weight';
import styles from './ProgressChart.module.css';

export default function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload) return null;

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipDate}>
        {new Date(label || '').toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </p>
      {payload.map((item, index) => (
        <p key={index} className={styles.tooltipValue} style={{ color: item.color }}>
          {item.dataKey === 'maxWeight' ? 'Max Weight' : 'Volume'}: {item.value.toLocaleString()}{' '}
          lbs ({lbsToKg(item.value)} kg)
        </p>
      ))}
    </div>
  );
}
