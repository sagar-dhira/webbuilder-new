/**
 * ETLBlock - same as framely-rebuilt Container ETL
 * Displays ETL job cards with status, rerun button, WebSocket for real-time updates
 */

import type { ComponentConfig } from "@puckeditor/core";
import { createUsePuck } from "@puckeditor/core";
import { useRef, useCallback, useEffect, useState, Component } from "react";
import { Database, Hash, FileText, Activity, Calendar, RefreshCw, Loader2 } from "lucide-react";
import {
  runEtlImmediateJob,
  ETL_WS_URL,
  type EtlRunJobParams,
} from "../api/etl.api";
import { EtlExecuteField } from "../components/EtlExecuteField";
import "./blocks-responsive.css";

const ETL_DEFAULT_BODY = (): string => {
  const raw = import.meta.env.VITE_ETL_DEFAULT_BODY;
  if (typeof raw === "string" && raw.trim()) {
    try {
      return JSON.stringify(JSON.parse(raw));
    } catch {
      return raw;
    }
  }
  return JSON.stringify({
    pipeline_name: "",
    limit: "",
    page_number: 1,
    filterStatus: "",
    data_flow_type: "ETL",
  });
};

export interface EtlBlockProps {
  apiEndpoint?: string;
  tenantName?: string;
  useToken?: boolean;
  request?: string;
  body?: string;
  etlDetailData?: Record<string, unknown>[];
  editMode?: boolean;
  id?: string;
  onUpdateDetailData?: (data: Record<string, unknown>[]) => void;
}

function formatDate(val: unknown): string {
  if (val == null || val === "") return "—";
  const str = String(val);
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const date = d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
      const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", hour12: true });
      return `${date} at ${time}`;
    }
  } catch {}
  return str;
}

function EtlJobCards({
  items,
  apiEndpoint,
  tenantName,
  useToken,
  onUpdateDetailData,
  rerunLoadingIndex,
  setRerunLoadingIndex,
}: {
  items: Record<string, unknown>[];
  apiEndpoint?: string;
  tenantName?: string;
  useToken?: boolean;
  onUpdateDetailData?: (data: Record<string, unknown>[]) => void;
  rerunLoadingIndex: number | null;
  setRerunLoadingIndex: (v: number | null) => void;
}) {
  const wsRef = useRef<WebSocket | null>(null);
  const elementRef = useRef({ items, onUpdateDetailData });
  elementRef.current = { items, onUpdateDetailData };
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
  const dropdownRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      for (const [, el] of dropdownRefs.current) {
        if (el?.contains(target)) return;
      }
      setOpenDropdownIndex(null);
    };
    if (openDropdownIndex !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdownIndex]);

  useEffect(() => {
    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, []);

  const handleRerunJob = useCallback(
    async (item: Record<string, unknown>, idx: number) => {
      const sessionId = item.session_id as string | undefined;
      if (!sessionId || typeof sessionId !== "string") {
        return;
      }
      const params: EtlRunJobParams = {
        apiEndpoint: apiEndpoint || "https://api-dev.akashic.dhira.io/application/data_flow/list",
        tenantName: tenantName?.trim() || import.meta.env.VITE_ETL_TENANT_NAME || "tenanta",
        useToken: useToken ?? true,
        sessionId,
      };
      setRerunLoadingIndex(idx);
      const result = await runEtlImmediateJob(params);
      if (!result.success) {
        setRerunLoadingIndex(null);
        return;
      }
      try {
        const ws = new WebSocket(ETL_WS_URL);
        wsRef.current = ws;
        const dataFlowId = item.data_flow_id ?? item.entity_id;
        const clearRunning = () => {
          wsRef.current?.close();
          wsRef.current = null;
          setRerunLoadingIndex(null);
        };
        ws.onmessage = (event) => {
          try {
            const parsed = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
            console.log("[ETL WebSocket]", parsed);
            const msg = parsed as {
              id?: number;
              status?: string;
              error?: string;
              last_executed?: string;
              messageType?: string;
            };
            if (msg.messageType !== "data_flow") return;
            const msgId = msg.id;
            if (msgId == null || String(msgId) !== String(dataFlowId)) return;
            const { items: detail, onUpdateDetailData: update } = elementRef.current;
            if (!Array.isArray(detail)) return;
            const itemIdx = detail.findIndex(
              (d) => String(d.data_flow_id ?? d.entity_id) === String(msgId)
            );
            if (itemIdx === -1) return;
            const updated = [...detail];
            const current = updated[itemIdx];
            if (current) {
              updated[itemIdx] = {
                ...current,
                status: msg.status ?? current.status,
                error: msg.error ?? current.error,
                last_executed: msg.last_executed ?? current.last_executed,
              };
            }
            update?.(updated);
            const s = (msg.status ?? "").toLowerCase();
            if (s === "failed" || s === "finished" || s === "completed" || s === "error") {
              clearRunning();
            }
          } catch {}
        };
        ws.onerror = () => clearRunning();
        ws.onclose = () => clearRunning();
      } catch {
        setRerunLoadingIndex(null);
      }
    },
    [apiEndpoint, tenantName, useToken, setRerunLoadingIndex]
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        minHeight: "100px",
        width: "100%",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        backgroundColor: "#fff",
        padding: "16px",
        overflow: "auto",
      }}
    >
      {items.map((item, idx) => {
        const flowId = item.data_flow_id ?? item.entity_id ?? "—";
        const flowName = item.data_flow_name ?? "—";
        const status = item.status ?? "—";
        const created = item.created_datetime_timestamp ?? item.created_datetime_times ?? "—";
        const lastExecuted = item.last_executed ?? "";
        const statusLower = String(status).toLowerCase();
        const statusColor =
          statusLower === "finished" || statusLower === "completed"
            ? "#059669"
            : statusLower === "running" || statusLower === "pending"
              ? "#d97706"
              : statusLower === "failed" || statusLower === "error"
                ? "#dc2626"
                : "#64748b";

        const hasRerun = typeof item.session_id === "string" && item.session_id.trim() !== "";

        return (
          <div
            key={idx}
            className={hasRerun ? "pb-etl-actions" : undefined}
            ref={hasRerun ? (el) => { dropdownRefs.current.set(idx, el); } : undefined}
            role={hasRerun ? "button" : undefined}
            tabIndex={hasRerun ? 0 : undefined}
            onKeyDown={hasRerun ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpenDropdownIndex((prev) => (prev === idx ? null : idx)); } } : undefined}
            onClick={hasRerun ? (e) => {
              e.stopPropagation();
              setOpenDropdownIndex((prev) => (prev === idx ? null : idx));
            } : undefined}
            onMouseDown={hasRerun ? (e) => e.stopPropagation() : undefined}
            style={{
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              background: "linear-gradient(to bottom right, #fff, #f8fafc)",
              padding: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              cursor: hasRerun ? "pointer" : undefined,
              position: "relative",
            }}
          >
            <div
              style={{
                display: "grid",
                gap: "12px",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Hash size={16} style={{ color: "#3b82f6" }} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: "11px", fontWeight: 500, color: "#64748b", textTransform: "uppercase" }}>
                    Data Flow ID
                  </p>
                  <p style={{ fontSize: "14px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {flowId != null ? String(flowId) : "—"}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FileText size={16} style={{ color: "#3b82f6" }} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: "11px", fontWeight: 500, color: "#64748b", textTransform: "uppercase" }}>
                    Data Flow Name
                  </p>
                  <p style={{ fontSize: "14px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {flowName != null ? String(flowName) : "—"}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Activity size={16} style={{ color: "#3b82f6" }} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: "11px", fontWeight: 500, color: "#64748b", textTransform: "uppercase" }}>
                    Status
                  </p>
                  <p style={{ fontSize: "14px", fontWeight: 500, color: statusColor, display: "flex", alignItems: "center", gap: "6px" }}>
                    {(rerunLoadingIndex === idx || statusLower === "running" || statusLower === "pending") ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Running
                      </>
                    ) : (
                      status != null && status !== "" ? String(status) : "—"
                    )}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Calendar size={16} style={{ color: "#3b82f6" }} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: "11px", fontWeight: 500, color: "#64748b", textTransform: "uppercase" }}>
                    Created
                  </p>
                  <p style={{ fontSize: "14px", fontWeight: 500 }}>{formatDate(created)}</p>
                </div>
              </div>
              {lastExecuted && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", gridColumn: "1 / -1" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <RefreshCw size={16} style={{ color: "#3b82f6" }} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: "11px", fontWeight: 500, color: "#64748b", textTransform: "uppercase" }}>
                      Last executed (live)
                    </p>
                    <p style={{ fontSize: "14px", fontWeight: 500 }}>{formatDate(lastExecuted)}</p>
                  </div>
                </div>
              )}
            </div>
            {hasRerun && openDropdownIndex === idx && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  marginTop: "4px",
                  minWidth: "140px",
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  zIndex: 50,
                  overflow: "hidden",
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  disabled={rerunLoadingIndex === idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRerunJob(item, idx);
                    setOpenDropdownIndex(null);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 12px",
                    fontSize: "14px",
                    border: "none",
                    background: "transparent",
                    cursor: rerunLoadingIndex === idx ? "not-allowed" : "pointer",
                    opacity: rerunLoadingIndex === idx ? 0.7 : 1,
                    color: "#334155",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    if (rerunLoadingIndex !== idx) {
                      (e.currentTarget as HTMLButtonElement).style.background = "#f1f5f9";
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  }}
                >
                  <RefreshCw
                    size={16}
                    className={rerunLoadingIndex === idx ? "animate-spin" : ""}
                  />
                  {rerunLoadingIndex === idx ? "Running…" : "Rerun job"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const ETLBlock: ComponentConfig = {
  fields: {
    apiEndpoint: { type: "text", label: "API Endpoint" },
    tenantName: { type: "text", label: "Tenant Name" },
    useToken: {
      type: "radio",
      label: "Use session token",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
    },
    request: { type: "text", label: "Request method" },
    body: { type: "textarea", label: "Body" },
    etlDetailData: {
      type: "custom",
      label: "Load ETL Data",
      render: ({ value, onChange }) => (
        <EtlExecuteField
          value={Array.isArray(value) ? value : []}
          onChange={(v) => onChange(v)}
        />
      ),
    },
  },

  defaultProps: {
    apiEndpoint: import.meta.env.VITE_ETL_API_URL || "https://api-dev.akashic.dhira.io/application/data_flow/list",
    tenantName: import.meta.env.VITE_ETL_TENANT_NAME || "tenanta",
    useToken: "true",
    request: "POST",
    body: ETL_DEFAULT_BODY(),
    etlDetailData: [],
  },

  render: (props: any) => {
    return <ETLBlockRender {...(props as EtlBlockProps)} />;
  },
};

const usePuck = createUsePuck();

function ETLBlockEmptyState() {
  return (
    <div
      className="pb-etl-block"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        minHeight: "100px",
        width: "100%",
        borderRadius: "8px",
        border: "2px dashed #cbd5e1",
        backgroundColor: "#f1f5f9",
        padding: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "48px",
          height: "48px",
          borderRadius: "8px",
          backgroundColor: "#e2e8f0",
        }}
      >
        <Database size={24} style={{ color: "#64748b" }} />
      </div>
      <span style={{ fontSize: "12px", fontWeight: 500, color: "#64748b" }}>ETL</span>
      <span style={{ fontSize: "12px", color: "#94a3b8" }}>
        Configure ETL in settings and click Execute to load data
      </span>
    </div>
  );
}

/** Renders when outside Puck (e.g. published view) - uses local state for updates */
function ETLBlockRenderReadOnly(props: EtlBlockProps) {
  const content = props;
  const etlDetailData = content.etlDetailData;
  const [items, setItems] = useState(Array.isArray(etlDetailData) ? etlDetailData : []);
  const [rerunLoadingIndex, setRerunLoadingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (Array.isArray(etlDetailData) && etlDetailData.length > 0) {
      setItems(etlDetailData);
    }
  }, [etlDetailData]);

  const onUpdateDetailData = useCallback((newData: Record<string, unknown>[]) => {
    setItems(newData);
  }, []);

  if (items.length === 0) return <ETLBlockEmptyState />;

  return (
    <div className="pb-etl-block" style={{ width: "100%", maxWidth: "100%", padding: 0 }}>
      <EtlJobCards
        items={items}
        apiEndpoint={content.apiEndpoint}
        tenantName={content.tenantName}
        useToken={String(content.useToken) === "true" || content.useToken === true}
        onUpdateDetailData={onUpdateDetailData}
        rerunLoadingIndex={rerunLoadingIndex}
        setRerunLoadingIndex={setRerunLoadingIndex}
      />
    </div>
  );
}

/** Renders when inside Puck editor - uses usePuck for state updates */
function ETLBlockRenderEditable(props: EtlBlockProps) {
  const content = props;
  const etlDetailData = content.etlDetailData;
  const items = Array.isArray(etlDetailData) ? etlDetailData : [];
  const [rerunLoadingIndex, setRerunLoadingIndex] = useState<number | null>(null);
  const appState = usePuck((s) => s.appState);
  const dispatch = usePuck((s) => s.dispatch);
  const blockId = content.id;

  const onUpdateDetailData = useCallback(
    (newData: Record<string, unknown>[]) => {
      if (!blockId || !dispatch || !appState?.data) return;
      const data = appState.data as { content?: unknown[]; root?: { props?: Record<string, unknown> } };
      const updateInArray = (arr: unknown[]): unknown[] =>
        arr.map((item) => {
          const el = item as { type?: string; props?: { id?: string; [k: string]: unknown } };
          if (el?.props?.id === blockId) {
            return { ...el, props: { ...el.props, etlDetailData: newData } };
          }
          const slotProps = el?.props as Record<string, unknown> | undefined;
          if (slotProps && typeof slotProps === "object") {
            for (const [k, v] of Object.entries(slotProps)) {
              if (Array.isArray(v) && v.some((x) => x && typeof x === "object" && "type" in (x as object))) {
                return { ...el, props: { ...slotProps, [k]: updateInArray(v) } };
              }
            }
          }
          return item;
        });
      const contentArr = data.content;
      const updated = {
        ...data,
        content: Array.isArray(contentArr) ? updateInArray(contentArr) : contentArr,
      };
      dispatch({ type: "setData", data: updated as any });
    },
    [blockId, dispatch, appState?.data]
  );

  if (items.length === 0) return <ETLBlockEmptyState />;

  return (
    <div className="pb-etl-block" style={{ width: "100%", maxWidth: "100%", padding: 0 }}>
      <EtlJobCards
        items={items}
        apiEndpoint={content.apiEndpoint}
        tenantName={content.tenantName}
        useToken={String(content.useToken) === "true" || content.useToken === true}
        onUpdateDetailData={onUpdateDetailData}
        rerunLoadingIndex={rerunLoadingIndex}
        setRerunLoadingIndex={setRerunLoadingIndex}
      />
    </div>
  );
}

class ETLBlockErrorBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    if (error?.message?.includes("usePuck must be used inside")) {
      return { hasError: true };
    }
    throw error;
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function ETLBlockRender(props: EtlBlockProps) {
  return (
    <ETLBlockErrorBoundary fallback={<ETLBlockRenderReadOnly {...props} />}>
      <ETLBlockRenderEditable {...props} />
    </ETLBlockErrorBoundary>
  );
}

export const ETLBlockConfig = ETLBlock;
