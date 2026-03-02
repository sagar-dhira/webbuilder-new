import { useEffect, useState } from "react";
import { httpClient } from "@/shared/services/http";

type SupersetConfigResponse = {
  success: boolean;
  baseUrl?: string;
  msg?: string;
};

type SupersetChartBlockProps = {
  editMode?: boolean;
  chartId?: string;
  baseUrl?: string;
  height?: string;
};

const SupersetChart = (props: SupersetChartBlockProps) => {
  const { editMode, chartId, baseUrl: baseUrlProp } = props;
  const [fetchedBaseUrl, setFetchedBaseUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const height = props.height && props.height.trim().length > 0 ? props.height : "400px";

  // Use baseUrl from props if provided (e.g. when dropped from Superset Charts list)
  const baseUrlFromProps = baseUrlProp?.toString().trim().replace(/\/$/, "");

  useEffect(() => {
    if (baseUrlFromProps || !chartId) return;
    let cancelled = false;

    const fetchConfig = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await httpClient.get<SupersetConfigResponse>("/superset/config");
        if (cancelled) return;
        if (res.data?.success) {
          const url =
            typeof res.data.baseUrl === "string" && res.data.baseUrl.trim()
              ? res.data.baseUrl.replace(/\/$/, "")
              : "http://localhost:3001";
          setFetchedBaseUrl(url);
        } else {
          setError("Superset base URL not configured");
        }
      } catch {
        if (!cancelled) setError("Failed to load Superset config");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchConfig();
    return () => { cancelled = true; };
  }, [chartId, baseUrlFromProps]);

  const baseUrl = baseUrlFromProps || (fetchedBaseUrl ?? "http://localhost:3001");

  const numericHeight = (() => {
    const parsed = parseInt(height, 10);
    if (Number.isFinite(parsed) && parsed > 0) return `${parsed}px`;
    return height;
  })();

  const trimmedChartId = chartId?.toString().trim();
  const hasConfig = !!baseUrl && !!trimmedChartId;

  const embedUrl = hasConfig
    ? `${baseUrl}/explore/?slice_id=${encodeURIComponent(
        trimmedChartId as string
      )}&standalone=1&height=${encodeURIComponent(numericHeight)}`
    : "";

  const isEdit = !!editMode;

  if (!chartId) {
    return (
      <div
        style={{
          borderRadius: "12px",
          border: "1px dashed #cbd5e1",
          backgroundColor: "#f8fafc",
          padding: "20px",
          minHeight: numericHeight,
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          color: "#64748b",
          fontSize: "14px",
        }}
      >
        <strong style={{ color: "#0f172a" }}>Superset chart</strong>
        <span>Set a Superset chart ID in the block settings.</span>
        {isEdit && (
          <span>
            Open your Superset instance, pick a chart, and copy its <code>id</code> into the{" "}
            <strong>Chart ID</strong> field.
          </span>
        )}
      </div>
    );
  }

  if (loading && !embedUrl) {
    return (
      <div
        style={{
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          backgroundColor: "#f8fafc",
          padding: "20px",
          minHeight: numericHeight,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#64748b",
          fontSize: "14px",
        }}
      >
        Loading Superset configuration…
      </div>
    );
  }

  if (error && !embedUrl) {
    return (
      <div
        style={{
          borderRadius: "12px",
          border: "1px solid #fecaca",
          backgroundColor: "#fef2f2",
          padding: "20px",
          minHeight: numericHeight,
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          color: "#b91c1c",
          fontSize: "14px",
        }}
      >
        <strong>Superset error</strong>
        <span>{error}</span>
      </div>
    );
  }

  if (!embedUrl) {
    return (
      <div
        style={{
          borderRadius: "12px",
          border: "1px dashed #cbd5e1",
          backgroundColor: "#f8fafc",
          padding: "20px",
          minHeight: numericHeight,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          color: "#64748b",
          fontSize: "14px",
        }}
      >
        Unable to build Superset embed URL. Check your chart ID and backend Superset config.
      </div>
    );
  }

  return (
    <div
      style={{
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        backgroundColor: "#ffffff",
        padding: "12px",
        boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
      }}
    >
      {isEdit && (
        <div
          style={{
            marginBottom: "8px",
            fontSize: "12px",
            color: "#64748b",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>
            Superset chart <code>#{trimmedChartId}</code>
          </span>
          <span style={{ opacity: 0.8 }}>Edit height or chart ID in settings</span>
        </div>
      )}
      <div
        style={{
          width: "100%",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <iframe
          src={embedUrl}
          title={trimmedChartId ? `Superset chart ${trimmedChartId}` : "Superset chart"}
          style={{
            width: "100%",
            height: numericHeight,
            border: "none",
            borderRadius: "8px",
            pointerEvents: isEdit ? "none" : "auto",
          }}
        />
      </div>
    </div>
  );
};

export const SupersetChartBlock = {
  fields: {
    chartId: { type: "text" },
    baseUrl: { type: "text" },
    height: { type: "text" },
  },

  defaultProps: {
    chartId: "",
    baseUrl: "",
    height: "400px",
  },

  render: (props: any) => {
    return <SupersetChart {...props} />;
  },
};

