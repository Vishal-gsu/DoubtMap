interface ProgressChartProps {
  score: number;
}

export function ProgressChart({ score }: ProgressChartProps) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;

  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f97316' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={72} height={72}>
        <circle
          cx={36}
          cy={36}
          r={radius}
          stroke="currentColor"
          strokeWidth={6}
          fill="none"
          className="text-muted/40"
        />
        <circle
          cx={36}
          cy={36}
          r={radius}
          stroke={color}
          strokeWidth={6}
          fill="none"
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
        />
        <text
          x={36}
          y={40}
          textAnchor="middle"
          fontSize={14}
          fontWeight="bold"
          fill={color}
        >
          {score}
        </text>
      </svg>
      <span className="text-xs text-muted-foreground">score</span>
    </div>
  );
}
