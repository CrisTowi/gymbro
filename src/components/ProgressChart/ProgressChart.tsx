'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { lbsToKg } from '@/utils/weight';
import styles from './ProgressChart.module.css';

interface DataPoint {
  date: string;
  maxWeight: number;
  totalVolume: number;
}

interface ProgressChartProps {
  data: DataPoint[];
  exerciseName: string;
  showVolume?: boolean;
}

function CustomTooltip({
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

export default function ProgressChart({
  data,
  exerciseName,
  showVolume = true,
}: ProgressChartProps) {
  if (data.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No data yet for {exerciseName}</p>
        <p className={styles.emptyHint}>Complete some workouts to see progress!</p>
      </div>
    );
  }

  const formattedData = data.map((d) => ({
    ...d,
    dateLabel: new Date(d.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <div className={styles.chart}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="dateLabel"
            stroke="var(--color-text-muted)"
            fontSize={12}
            tick={{ fill: 'var(--color-text-muted)' }}
          />
          <YAxis
            stroke="var(--color-text-muted)"
            fontSize={12}
            tick={{ fill: 'var(--color-text-muted)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--color-text-muted)' }} />
          <Line
            type="monotone"
            dataKey="maxWeight"
            name="Max Weight (lbs)"
            stroke="var(--color-accent)"
            strokeWidth={2}
            dot={{ r: 4, fill: 'var(--color-accent)' }}
            activeDot={{ r: 6 }}
          />
          {showVolume && (
            <Line
              type="monotone"
              dataKey="totalVolume"
              name="Volume (lbs)"
              stroke="var(--color-info)"
              strokeWidth={2}
              dot={{ r: 4, fill: 'var(--color-info)' }}
              activeDot={{ r: 6 }}
              yAxisId={1}
            />
          )}
          {showVolume && (
            <YAxis
              yAxisId={1}
              orientation="right"
              stroke="var(--color-text-muted)"
              fontSize={12}
              tick={{ fill: 'var(--color-text-muted)' }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
