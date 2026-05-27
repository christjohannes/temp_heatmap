import { InteractionData } from "./Heatmap";

type TooltipProps = {
  interactionData: InteractionData | null;
  width: number;
  height: number;
};

export const Tooltip = ({ interactionData, width, height }: TooltipProps) => {
  if (!interactionData) {
    return null;
  }

  const { xPos, yPos, yLabel, xLabel, value, color, placement } = interactionData;

  return (
    <div style={{ width, height, position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
      <div
        className={placement === "left" ? "tooltip tooltip--left" : "tooltip"}
        style={{
          left: placement === "left" ? xPos - 10 : xPos + 10,
          top: yPos,
          transform: placement === "left" ? "translateX(-100%) translateY(-50%)" : "translateY(-50%)",
          borderColor: color,
          "--border-color": color,
        } as React.CSSProperties}
      >
        <span className="tooltip_name" style={{ display: "block" }}>{yLabel}</span>
        <span className="tooltip_time" style={{ display: "block" }}>Week {xLabel}</span>
        <span className="tooltip_value" style={{ display: "block" }}>{value}°C</span>
      </div>
    </div>
  );
};
