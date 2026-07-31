"use client";

import { useMemo, useState } from "react";

export type AnalyticsRange = 7 | 14 | 30;

export type AnalyticsTrendPoint = {
  date: string;
  label: string;
  revenue: number;
  tickets: number;
  checkIns: number;
};

type AnalyticsMetric =
  | "revenue"
  | "tickets"
  | "checkIns";

type AnalyticsTrendChartProps = {
  data: AnalyticsTrendPoint[] | undefined;
  days: AnalyticsRange;
  onDaysChange: (days: AnalyticsRange) => void;
};

const chartWidth = 760;
const chartHeight = 300;
const padding = {
  top: 34,
  right: 26,
  bottom: 48,
  left: 62,
};
const plotWidth =
  chartWidth - padding.left - padding.right;
const plotHeight =
  chartHeight - padding.top - padding.bottom;

const metricConfig: Record<
  AnalyticsMetric,
  {
    label: string;
    color: string;
    glow: string;
    buttonClasses: string;
  }
> = {
  revenue: {
    label: "Revenue",
    color: "#a78bfa",
    glow: "rgba(167, 139, 250, 0.25)",
    buttonClasses:
      "border-violet-400/25 bg-violet-400/10 text-violet-200",
  },
  tickets: {
    label: "Ticket sales",
    color: "#fb923c",
    glow: "rgba(251, 146, 60, 0.25)",
    buttonClasses:
      "border-orange-400/25 bg-orange-400/10 text-orange-200",
  },
  checkIns: {
    label: "Check-ins",
    color: "#34d399",
    glow: "rgba(52, 211, 153, 0.25)",
    buttonClasses:
      "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  },
};

const ranges: AnalyticsRange[] = [7, 14, 30];

function formatMetricValue(
  metric: AnalyticsMetric,
  value: number
): string {
  if (metric === "revenue") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: value < 100 ? 2 : 0,
    }).format(value);
  }

  return Math.round(value).toLocaleString();
}

function formatAxisValue(
  metric: AnalyticsMetric,
  value: number
): string {
  const formatted = new Intl.NumberFormat("en-US", {
    notation: value >= 1_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);

  return metric === "revenue" ? `$${formatted}` : formatted;
}

function getValue(
  point: AnalyticsTrendPoint,
  metric: AnalyticsMetric
): number {
  return point[metric];
}

function getTickIndexes(length: number): Set<number> {
  if (length <= 1) {
    return new Set([0]);
  }

  const interval = Math.max(1, Math.ceil((length - 1) / 5));
  const indexes = new Set<number>([0, length - 1]);

  for (let index = interval; index < length - 1; index += interval) {
    indexes.add(index);
  }

  return indexes;
}

export default function AnalyticsTrendChart({
  data,
  days,
  onDaysChange,
}: AnalyticsTrendChartProps) {
  const [metric, setMetric] =
    useState<AnalyticsMetric>("revenue");
  const [activeIndex, setActiveIndex] =
    useState<number | null>(null);
  const config = metricConfig[metric];

  const chart = useMemo(() => {
    if (!data || data.length === 0) {
      return null;
    }

    const values = data.map((point) =>
      getValue(point, metric)
    );
    const rawMaximum = Math.max(...values, 0);
    const maximum = rawMaximum > 0 ? rawMaximum * 1.12 : 1;
    const denominator = Math.max(1, data.length - 1);
    const xPosition = (index: number) =>
      padding.left +
      (index / denominator) * plotWidth;
    const yPosition = (value: number) =>
      padding.top +
      plotHeight -
      (value / maximum) * plotHeight;
    const points = data.map((point, index) => ({
      x: xPosition(index),
      y: yPosition(getValue(point, metric)),
    }));
    const linePath = points
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
      )
      .join(" ");
    const baseline = padding.top + plotHeight;
    const areaPath = `${linePath} L ${
      points[points.length - 1].x
    } ${baseline} L ${points[0].x} ${baseline} Z`;
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map(
      (ratio) => ({
        value: maximum * ratio,
        y: padding.top + plotHeight - ratio * plotHeight,
      })
    );

    return {
      areaPath,
      linePath,
      points,
      xTickIndexes: getTickIndexes(data.length),
      yTicks,
    };
  }, [data, metric]);

  const latestIndex = Math.max(0, (data?.length ?? 1) - 1);
  const selectedIndex = activeIndex ?? latestIndex;
  const selectedPoint = data?.[selectedIndex];
  const selectedCoordinates = chart?.points[selectedIndex];
  const total = useMemo(
    () =>
      (data ?? []).reduce(
        (sum, point) => sum + getValue(point, metric),
        0
      ),
    [data, metric]
  );

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[#0c0b14]/90 shadow-[0_30px_100px_rgba(0,0,0,0.25)] backdrop-blur-xl">
      <div className="border-b border-white/[0.07] px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-400">
              Live performance
            </p>

            <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-2">
              <h2 className="text-xl font-black tracking-tight sm:text-2xl">
                {config.label}
              </h2>

              <p className="pb-0.5 text-sm font-bold text-zinc-500">
                {formatMetricValue(metric, total)} in {days} days
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div
              className="flex flex-wrap gap-2"
              aria-label="Analytics metric"
            >
              {(Object.keys(metricConfig) as AnalyticsMetric[]).map(
                (option) => {
                  const optionConfig = metricConfig[option];
                  const isActive = option === metric;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setMetric(option);
                        setActiveIndex(null);
                      }}
                      aria-pressed={isActive}
                      className={`rounded-full border px-3 py-2 text-[11px] font-black transition ${
                        isActive
                          ? optionConfig.buttonClasses
                          : "border-white/[0.08] bg-white/[0.025] text-zinc-500 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {optionConfig.label}
                    </button>
                  );
                }
              )}
            </div>

            <div
              className="flex w-fit rounded-full border border-white/[0.08] bg-black/40 p-1"
              aria-label="Analytics date range"
            >
              {ranges.map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => onDaysChange(range)}
                  aria-pressed={days === range}
                  className={`rounded-full px-3 py-1.5 text-[10px] font-black transition ${
                    days === range
                      ? "bg-white text-black"
                      : "text-zinc-500 hover:text-white"
                  }`}
                >
                  {range}D
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {data === undefined ? (
        <ChartLoading />
      ) : data.length === 0 || !chart ? (
        <div className="px-6 py-16 text-center text-sm text-zinc-500">
          Analytics data is not available yet.
        </div>
      ) : (
        <div className="px-2 pb-3 pt-5 sm:px-4">
          <div className="overflow-x-auto pb-2">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full min-w-[680px]"
              role="img"
              aria-label={`${config.label} across the last ${days} days`}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <defs>
                <linearGradient
                  id={`analytics-fill-${metric}`}
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={config.color}
                    stopOpacity="0.28"
                  />
                  <stop
                    offset="100%"
                    stopColor={config.color}
                    stopOpacity="0"
                  />
                </linearGradient>

                <filter
                  id={`analytics-glow-${metric}`}
                  x="-30%"
                  y="-30%"
                  width="160%"
                  height="160%"
                >
                  <feDropShadow
                    dx="0"
                    dy="3"
                    stdDeviation="6"
                    floodColor={config.glow}
                  />
                </filter>
              </defs>

              {chart.yTicks.map((tick) => (
                <g key={tick.y}>
                  <line
                    x1={padding.left}
                    x2={chartWidth - padding.right}
                    y1={tick.y}
                    y2={tick.y}
                    stroke="rgba(255,255,255,0.07)"
                    strokeDasharray="4 7"
                  />

                  <text
                    x={padding.left - 12}
                    y={tick.y + 4}
                    textAnchor="end"
                    fill="#71717a"
                    fontSize="10"
                    fontWeight="700"
                  >
                    {formatAxisValue(metric, tick.value)}
                  </text>
                </g>
              ))}

              <path
                d={chart.areaPath}
                fill={`url(#analytics-fill-${metric})`}
              />

              <path
                d={chart.linePath}
                fill="none"
                stroke={config.color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={`url(#analytics-glow-${metric})`}
              />

              {data.map((point, index) => {
                const coordinates = chart.points[index];
                const isActive = index === selectedIndex;

                return (
                  <g key={point.date}>
                    {chart.xTickIndexes.has(index) ? (
                      <text
                        x={coordinates.x}
                        y={chartHeight - 16}
                        textAnchor="middle"
                        fill="#71717a"
                        fontSize="10"
                        fontWeight="700"
                      >
                        {point.label}
                      </text>
                    ) : null}

                    <circle
                      cx={coordinates.x}
                      cy={coordinates.y}
                      r={isActive ? 5 : 3}
                      fill={isActive ? "#09090b" : config.color}
                      stroke={config.color}
                      strokeWidth={isActive ? 3 : 0}
                    />

                    <circle
                      cx={coordinates.x}
                      cy={coordinates.y}
                      r="17"
                      fill="transparent"
                      className="cursor-crosshair outline-none"
                      tabIndex={0}
                      aria-label={`${point.label}: ${formatMetricValue(
                        metric,
                        getValue(point, metric)
                      )}`}
                      onMouseEnter={() => setActiveIndex(index)}
                      onFocus={() => setActiveIndex(index)}
                      onBlur={() => setActiveIndex(null)}
                    />
                  </g>
                );
              })}

              {selectedPoint && selectedCoordinates ? (
                <Tooltip
                  point={selectedPoint}
                  metric={metric}
                  x={selectedCoordinates.x}
                  y={selectedCoordinates.y}
                  color={config.color}
                />
              ) : null}
            </svg>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] px-2 pb-2 pt-4 text-xs sm:px-3">
            <p className="text-zinc-600">
              Hover or focus any point for daily detail.
            </p>

            <p className="font-bold text-zinc-400">
              {selectedPoint?.label ?? "Latest"}
              <span className="mx-2 text-zinc-700">·</span>
              <span style={{ color: config.color }}>
                {formatMetricValue(
                  metric,
                  selectedPoint
                    ? getValue(selectedPoint, metric)
                    : 0
                )}
              </span>
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function Tooltip({
  point,
  metric,
  x,
  y,
  color,
}: {
  point: AnalyticsTrendPoint;
  metric: AnalyticsMetric;
  x: number;
  y: number;
  color: string;
}) {
  const width = 138;
  const height = 54;
  const tooltipX = Math.min(
    chartWidth - padding.right - width,
    Math.max(padding.left, x - width / 2)
  );
  const tooltipY = Math.max(
    4,
    y - height - 16
  );

  return (
    <g pointerEvents="none">
      <line
        x1={x}
        x2={x}
        y1={padding.top}
        y2={padding.top + plotHeight}
        stroke={color}
        strokeOpacity="0.2"
        strokeDasharray="3 5"
      />

      <rect
        x={tooltipX}
        y={tooltipY}
        width={width}
        height={height}
        rx="12"
        fill="#15131f"
        stroke="rgba(255,255,255,0.12)"
      />

      <text
        x={tooltipX + 12}
        y={tooltipY + 20}
        fill="#a1a1aa"
        fontSize="10"
        fontWeight="700"
      >
        {point.label}
      </text>

      <text
        x={tooltipX + 12}
        y={tooltipY + 40}
        fill={color}
        fontSize="14"
        fontWeight="900"
      >
        {formatMetricValue(
          metric,
          getValue(point, metric)
        )}
      </text>
    </g>
  );
}

function ChartLoading() {
  return (
    <div className="animate-pulse px-5 py-8 sm:px-7">
      <div className="h-[250px] rounded-2xl bg-white/[0.035]" />
      <div className="mt-4 h-3 w-1/3 rounded-full bg-white/[0.05]" />
    </div>
  );
}
