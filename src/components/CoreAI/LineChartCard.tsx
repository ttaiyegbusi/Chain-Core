"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  ColorType,
  CrosshairMode,
  createChart,
  type AreaData,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";
import { ChartLineResponse } from "./types";

const RANGE_LABELS = ["1M", "6M", "YTD", "1YR"];

const monthStarts = [
  "2024-01-01",
  "2024-02-01",
  "2024-03-01",
  "2024-04-01",
  "2024-05-01",
  "2024-06-01",
  "2024-07-01",
  "2024-08-01",
];

export default function LineChartCard({ chart }: { chart: ChartLineResponse }) {
  const [activeTab, setActiveTab] = useState("YTD");
  const [year, setYear] = useState("2024");
  const data = useMemo(() => buildTrendData(activeTab), [activeTab]);

  return (
    <div className="mt-4 rounded-[20px] border border-[#ECEFF3] bg-[#F7F8FA] p-4 coreai-fade-up">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[13px] font-medium tracking-[-0.02em] text-[#15181E]">
          {chart.title || "Revenue"}
        </h3>
        <button
          type="button"
          className="focus-ring flex h-8 items-center gap-1 rounded-lg border border-[#E3E7EC] bg-white px-2.5 text-[11px] font-medium text-[#15181E] shadow-[0_1px_2px_rgba(16,24,40,0.03)]"
        >
          {year}
          <ChevronDown size={13} className="text-[#8A93A3]" aria-hidden />
        </button>
      </div>

      <div className="mb-3 inline-flex rounded-lg border border-[#E6EAF0] bg-white p-1 shadow-[0_1px_2px_rgba(16,24,40,0.02)]">
        {RANGE_LABELS.map((range) => {
          const active = activeTab === range;
          return (
            <button
              key={range}
              type="button"
              onClick={() => setActiveTab(range)}
              className={[
                "focus-ring h-7 rounded-md px-3 text-[11px] font-medium tracking-[-0.02em] transition-colors",
                active
                  ? "bg-[#F2F4F7] text-[#15181E] shadow-[0_1px_1px_rgba(16,24,40,0.03)]"
                  : "text-[#8A93A3] hover:bg-[#F7F8FA] hover:text-[#4B5563]",
              ].join(" ")}
            >
              {range}
            </button>
          );
        })}
      </div>

      <div className="rounded-[16px] border border-[#EEF1F4] bg-white px-2 pb-2 pt-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
        <TradingViewAreaChart data={data} />
      </div>
    </div>
  );
}

function TradingViewAreaChart({ data }: { data: AreaData[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 190,
      layout: {
        background: { type: ColorType.Solid, color: "#FFFFFF" },
        textColor: "#98A2B3",
        fontFamily: "Geist, Inter, system-ui, sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: "#F0F3F6", style: 0, visible: true },
      },
      rightPriceScale: { visible: false, borderVisible: false },
      leftPriceScale: { visible: false, borderVisible: false },
      timeScale: {
        borderVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
        timeVisible: false,
        secondsVisible: false,
      },
      crosshair: {
        mode: CrosshairMode.Magnet,
        vertLine: { color: "rgba(49,87,246,0.16)", width: 1, style: 3, labelVisible: false },
        horzLine: { visible: false, labelVisible: false },
      },
      handleScroll: false,
      handleScale: false,
      kineticScroll: { touch: false, mouse: false },
    });

    const areaSeries = chart.addAreaSeries({
      lineColor: "#3157F6",
      topColor: "rgba(49, 87, 246, 0.18)",
      bottomColor: "rgba(49, 87, 246, 0.01)",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      crosshairMarkerBackgroundColor: "#3157F6",
      crosshairMarkerBorderColor: "#FFFFFF",
      crosshairMarkerBorderWidth: 2,
    });

    areaSeries.setData(data);
    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = areaSeries;

    const ro = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      chart.applyOptions({ width });
      chart.timeScale().fitContent();
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    seriesRef.current?.setData(data);
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  return (
    <div>
      <div ref={containerRef} className="h-[190px] w-full" />
      <div className="-mt-1 grid grid-cols-8 px-1 text-center text-[10px] font-medium text-[#9AA3B2]">
        {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"].map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  );
}

function buildTrendData(range: string): AreaData[] {
  const base = [42, 45, 43, 47, 49, 52, 50, 54];
  const multiplier = range === "1M" ? 0.88 : range === "6M" ? 0.96 : range === "1YR" ? 1.08 : 1;
  const points: AreaData[] = [];

  monthStarts.forEach((start, monthIndex) => {
    const anchor = base[monthIndex] * multiplier;
    const [year, month] = start.split("-").map(Number);
    for (let j = 0; j < 5; j++) {
      const day = 1 + j * 6;
      const wave = Math.sin((monthIndex * 5 + j) * 0.85) * 1.5;
      const micro = Math.cos((monthIndex + j) * 1.6) * 0.65;
      const value = Math.max(32, anchor + wave + micro + j * 0.45);
      points.push({
        time: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        value: Number(value.toFixed(2)),
      });
    }
  });

  return points;
}
