import { useMemo, useState } from "react";
import * as d3 from "d3";
import { Tooltip } from "./Tooltip";
import { ColorLegend } from "./ColorLegend";

const MARGIN = { top: 10, right: 10, bottom: 30, left: 100 };

type HeatmapProps = {
  width: number;
  height: number;
  data: { week: string; city: string; temp: number }[];
};

export type InteractionData = {
  xLabel: number;
  yLabel: string;
  xPos: number;
  yPos: number;
  value: number;
  color: string;
  placement: "left" | "right";
};

export const Heatmap = ({ width, height, data }: HeatmapProps) => {
  const [hoveredCell, setHoveredCell] = useState<InteractionData | null>(null);
  // bounds = area inside the axis
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // groups
  const allYGroups = useMemo(() => [...new Set(data.map((d) => d.city).reverse())], [data]);
  const allXGroups = useMemo(() => [...new Set(data.map((d) => d.week))], [data]);

  // x and y scales
  const xScale = useMemo(() => {
    return d3
      .scaleBand()
      .range([0, boundsWidth])
      .domain(allXGroups)
      .padding(0.01);
  }, [data, width]);

  const yScale = useMemo(() => {
    return d3
      .scaleBand()
      .range([boundsHeight, 0])
      .domain(allYGroups)
      .padding(0.01);
  }, [data, height]);

  const [min, max] = d3.extent(data.map((d) => d.temp));

  if (!min || !max) {
    return null;
  }

  const PIVOT = 17.5;
  const blueColors = ["#002a95", "#0858cf", "#2b6be7", "#4f80ff", "#6591ff", "#7ca2ff", "#a5c6ff", "#eff3f5"];
  const redColors  = ["#dde1e3", "#ffaf73", "#ff8b53", "#ff6531", "#d23b06", "#b82100", "#9c0100", "#780000"];

  const blueScale = d3.scaleLinear<string>()
    .domain(blueColors.map((_, i) => min + (PIVOT - min) * i / (blueColors.length - 1)))
    .range(blueColors)
    .clamp(true);

  const redScale = d3.scaleLinear<string>()
    .domain(redColors.map((_, i) => PIVOT + (max - PIVOT) * i / (redColors.length - 1)))
    .range(redColors)
    .clamp(true);

  const colorScale = (temp: number) => temp <= PIVOT ? blueScale(temp) : redScale(temp);

  // Build the rectangles
  const allRects = data.map((d, i) => {
    const isHovered = hoveredCell?.yLabel === d.city && hoveredCell?.xLabel === +d.week + 1;
    return (
      <rect
        key={i}
        x={xScale(d.week)}
        y={yScale(d.city)}
        width={xScale.bandwidth()}
        height={yScale.bandwidth()}
        fill={colorScale(d.temp)}
        fillOpacity={hoveredCell === null || isHovered ? 1 : 0.5}
        rx={1}
        stroke={"white"}
        strokeWidth={1}
        onMouseEnter={() => {
          const xPos = (xScale(d.week) ?? 0) + xScale.bandwidth() / 2 + MARGIN.left;
          setHoveredCell({
            xLabel: +d.week + 1,
            yLabel: d.city,
            xPos,
            yPos: (yScale(d.city) ?? 0) + yScale.bandwidth() / 2 + MARGIN.top,
            value: Math.round(d.temp * 10) / 10,
            color: colorScale(d.temp),
            placement: xPos > width / 2 ? "left" : "right",
          });
        }}
        onMouseLeave={() => setHoveredCell(null)}
      />
    );
  });

  const xLabels = allXGroups
    .filter((week) => ["0", "9", "19", "29", "39", "49"].includes(week))
    .map((week, i) => {
      const xPos = xScale(week) ?? 0;
      return (
        <text
          key={i}
          x={xPos + xScale.bandwidth() / 2}
          y={boundsHeight + 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={12}
        >
          {+week + 1}
        </text>
      );
    });

  const yLabels = allYGroups.map((city, i) => {
    const yPos = yScale(city) ?? 0;
    return (
      <text
        key={i}
        x={-5}
        y={yPos + yScale.bandwidth() / 2}
        textAnchor="end"
        dominantBaseline="middle"
        fontSize={12}
      >
        {city}
      </text>
    );
  });

  return (
    <div style={{ position: "relative" }}>
      <svg width={width} height={height} style={{ display: "block" }}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        >
          {allRects}
          {xLabels}
          {yLabels}
        </g>
      </svg>
      <Tooltip interactionData={hoveredCell} width={width} height={height} />
      <div style={{ marginLeft: MARGIN.left, width: boundsWidth, display: "flex", justifyContent: "center" }}>
        <ColorLegend
          height={60}
          width={200}
          min={min}
          max={max}
          colorScale={colorScale}
          interactionData={hoveredCell}
        />
      </div>
    </div>
  );
};
