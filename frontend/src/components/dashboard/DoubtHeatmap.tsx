'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { DoubtHeatmapItem } from '@/lib/types';

interface DoubtHeatmapProps {
  data: DoubtHeatmapItem[];
}

function getColor(count: number, max: number) {
  const ratio = count / max;
  if (ratio > 0.7) return '#ef4444';
  if (ratio > 0.4) return '#f97316';
  return '#22c55e';
}

export function DoubtHeatmap({ data }: DoubtHeatmapProps) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
          <XAxis
            dataKey="topic"
            tick={{ fontSize: 11 }}
            angle={-30}
            textAnchor="end"
          />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const item = payload[0].payload as DoubtHeatmapItem;
              return (
                <div className="rounded-md border bg-background p-2 text-xs shadow">
                  <p className="font-medium mb-0.5">{item.topic}</p>
                  <p>{item.count} doubts</p>
                  <p>Avg confidence: {Math.round(item.avg_confidence * 100)}%</p>
                </div>
              );
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={getColor(entry.count, max)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
