/**
 * SupersetChartBlock - same as framely Chart.tsx
 * embedUrl = ${baseUrl}/explore/?slice_id=${chartId}&standalone=1&height=${height}
 * Resizing: height presets + aspect-ratio option for responsiveness
 */

import type { ComponentConfig } from "@puckeditor/core";
import "./blocks-responsive.css";

const baseBlock: ComponentConfig = {
  fields: {
    chartId: { type: "number" },
    chartTitle: { type: "text" },
    baseUrl: { type: "text" },
    height: {
      type: "select",
      label: "Height",
      options: [
        { label: "300px", value: "300" },
        { label: "400px", value: "400" },
        { label: "500px", value: "500" },
        { label: "600px", value: "600" },
        { label: "50vh (responsive)", value: "50vh" },
        { label: "60vh (responsive)", value: "60vh" },
      ],
    },
    useAspectRatio: {
      type: "radio",
      label: "Resize mode",
      options: [
        { label: "Fixed height", value: "false" },
        { label: "Responsive (16:9)", value: "true" },
      ],
    },
  },

  defaultProps: {
    chartId: 0,
    chartTitle: "",
    baseUrl: "",
    height: "400",
    useAspectRatio: "false",
  },

  render: (props: any) => {
    const content = props as {
      chartId?: number;
      baseUrl?: string;
      height?: string;
      chartTitle?: string;
      useAspectRatio?: string;
    };
    const chartId = content.chartId;
    const baseUrl = (content.baseUrl || "").replace(/\/$/, "");
    const heightVal = String(content.height ?? "400");
    const heightPx = heightVal.includes("vh") ? 400 : parseInt(heightVal, 10) || 400;
    const useAspectRatio = content.useAspectRatio === "true";

    const embedUrl =
      chartId && baseUrl
        ? `${baseUrl}/explore/?slice_id=${chartId}&standalone=1&height=${heightPx}`
        : "";

    if (!embedUrl) {
      return (
        <div
          className="pb-superset-chart"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#94a3b8",
            fontSize: "14px",
            padding: "24px",
            gap: "8px",
            minHeight: "200px",
            backgroundColor: "#f1f5f9",
            borderRadius: "8px",
            border: "2px dashed #cbd5e1",
            width: "100%",
            maxWidth: "100%",
          }}
        >
          <span style={{ fontSize: "24px" }}>📊</span>
          <span>Configure chart in settings (chart ID + Superset URL)</span>
        </div>
      );
    }

    const containerStyle: React.CSSProperties = useAspectRatio
      ? {
          aspectRatio: "16 / 9",
          width: "100%",
          maxWidth: "100%",
          borderRadius: "8px",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
        }
      : {
          width: "100%",
          maxWidth: "100%",
          borderRadius: "8px",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          minHeight: "200px",
        };

    const heightStyle = useAspectRatio
      ? "100%"
      : heightVal.includes("vh")
        ? heightVal
        : `${heightPx}px`;

    return (
      <div className="pb-superset-chart" style={containerStyle}>
        <iframe
          src={embedUrl}
          title={content.chartTitle || "Superset Chart"}
          style={{
            width: "100%",
            height: heightStyle,
            border: "none",
          }}
        />
      </div>
    );
  },
};

export const SupersetChartBlock = baseBlock;

/** Create block with chartId, slice_name, baseUrl - same as framely */
export function createSupersetChartBlock(
  chartId: number,
  sliceName: string,
  baseUrl: string
): ComponentConfig {
  return {
    ...baseBlock,
    defaultProps: {
      ...baseBlock.defaultProps,
      chartId,
      chartTitle: sliceName,
      baseUrl,
      height: "400",
    },
  };
}
