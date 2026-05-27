import { InteractionData } from "./Heatmap";
import * as d3 from "d3";
import { useEffect, useRef } from "react";

type ColorLegendProps = {
  height: number;
  width: number;
  min: number;
  max: number;
  colorScale: (v: number) => string;
  interactionData: InteractionData | null;
};

const COLOR_LEGEND_MARGIN = { top: 0, right: 20, bottom: 50, left: 20 };

export const ColorLegend = ({
  height,
  width,
  min,
  max,
  colorScale,
  interactionData,
}: ColorLegendProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const boundsWidth = width - COLOR_LEGEND_MARGIN.right - COLOR_LEGEND_MARGIN.left;
  const boundsHeight = height - COLOR_LEGEND_MARGIN.top - COLOR_LEGEND_MARGIN.bottom;

  const xScale = d3.scaleLinear().range([0, boundsWidth]).domain([min, max]);

  const allTicks = xScale.ticks(5).map((tick) => (
    <g key={tick}>
      <line x1={xScale(tick)} x2={xScale(tick)} y1={0} y2={boundsHeight + 10} stroke="#0f151a" />
      <text x={xScale(tick)} y={boundsHeight + 20} fontSize={12} textAnchor="middle">
        {tick}
      </text>
    </g>
  ));

  const hoveredValue = interactionData?.value ?? null;
  const x = hoveredValue !== null ? xScale(hoveredValue) : null;
  const triangleWidth = 9;
  const triangleHeight = 6;
  const triangle = x !== null ? (
    <polygon
      points={`${x},0 ${x - triangleWidth / 2},${-triangleHeight} ${x + triangleWidth / 2},${-triangleHeight}`}
      fill="grey"
    />
  ) : null;

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!context || boundsWidth <= 0) return;

    for (let i = 0; i < boundsWidth; ++i) {
      context.fillStyle = colorScale(min + (max - min) * (i / boundsWidth));
      context.fillRect(i, 0, 1, boundsHeight);
    }
  }, [width, height, min, max]);

  return (
    <div style={{ width, height }}>
      <div style={{ position: "relative", marginLeft: COLOR_LEGEND_MARGIN.left, overflow: "visible" }}>
        <canvas ref={canvasRef} width={boundsWidth} height={boundsHeight} />
        <svg
          width={boundsWidth}
          height={boundsHeight}
          style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }}
        >
          {allTicks}
          {triangle}
        </svg>
      </div>
    </div>
  );
};
