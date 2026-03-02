/**
 * Custom action bar that adds "Rerun job" for ETL blocks alongside Duplicate and Delete
 */

import { useCallback, useState } from "react";
import { ActionBar } from "@puckeditor/core";
import { RefreshCw } from "lucide-react";
import { createUsePuck, useGetPuck } from "@puckeditor/core";
import { runEtlImmediateJob, ETL_WS_URL } from "../api/etl.api";

const usePuck = createUsePuck();

interface ActionBarProps {
  label?: string;
  children: React.ReactNode;
  parentAction: React.ReactNode;
}

export function ETLActionBarOverride(props: ActionBarProps) {
  const { label, children, parentAction } = props;
  const selectedItem = usePuck((s) => s.selectedItem);
  const getPuck = useGetPuck();
  const [rerunLoading, setRerunLoading] = useState(false);

  const isETL = selectedItem?.type === "ETL";
  const etlProps = isETL ? (selectedItem?.props as Record<string, unknown>) : undefined;
  const etlDetailData = Array.isArray(etlProps?.etlDetailData) ? etlProps.etlDetailData : [];
  const firstRerunnable = etlDetailData.find(
    (d: Record<string, unknown>) => typeof d?.session_id === "string" && String(d.session_id).trim() !== ""
  );
  const canRerun = isETL && firstRerunnable;

  const handleRerun = useCallback(async () => {
    if (!canRerun || !firstRerunnable || rerunLoading) return;
    const sessionId = firstRerunnable.session_id as string;
    const apiEndpoint = (etlProps?.apiEndpoint as string)?.trim() || "https://api-dev.akashic.dhira.io/application/data_flow/list";
    const tenantName = (etlProps?.tenantName as string)?.trim() || import.meta.env.VITE_ETL_TENANT_NAME || "tenanta";
    const useToken = (etlProps?.useToken as string) === "true" || etlProps?.useToken === true;

    setRerunLoading(true);
    const result = await runEtlImmediateJob({
      apiEndpoint,
      tenantName,
      useToken: useToken ?? true,
      sessionId,
    });
    setRerunLoading(false);

    if (result.success && selectedItem?.props) {
      const dataFlowId = firstRerunnable.data_flow_id ?? firstRerunnable.entity_id;
      const blockId = selectedItem.props.id;
      try {
        const ws = new WebSocket(ETL_WS_URL);
        ws.onmessage = (event: MessageEvent) => {
          try {
            const parsed = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
            console.log("[ETL WebSocket]", parsed);
            const msg = parsed as { id?: number; status?: string; last_executed?: string; messageType?: string };
            if (msg.messageType !== "data_flow" || msg.id == null || String(msg.id) !== String(dataFlowId)) return;
            const { appState, dispatch } = getPuck();
            const data = appState?.data as { content?: unknown[] } | undefined;
            if (!data?.content || !Array.isArray(data.content)) return;
            const updateInArray = (arr: unknown[]): unknown[] =>
              arr.map((item) => {
                const el = item as { type?: string; props?: Record<string, unknown> };
                if (el?.props?.id === blockId && Array.isArray(el.props?.etlDetailData)) {
                  const idx = el.props.etlDetailData.findIndex(
                    (d: Record<string, unknown>) => String(d?.data_flow_id ?? d?.entity_id) === String(dataFlowId)
                  );
                  if (idx >= 0) {
                    const updated = [...el.props.etlDetailData];
                    updated[idx] = { ...updated[idx], status: msg.status, last_executed: msg.last_executed };
                    return { ...el, props: { ...el.props, etlDetailData: updated } };
                  }
                }
                if (el?.props && typeof el.props === "object") {
                  for (const [k, v] of Object.entries(el.props)) {
                    if (Array.isArray(v) && v.some((x) => x && typeof x === "object" && "type" in (x as object))) {
                      return { ...el, props: { ...el.props, [k]: updateInArray(v) } };
                    }
                  }
                }
                return item;
              });
            const updated = { ...data, content: updateInArray(data.content) };
            dispatch({ type: "setData", data: updated as never });
            const s = (msg.status ?? "").toLowerCase();
            if (["failed", "finished", "completed", "error"].includes(s)) ws.close();
          } catch {}
        };
        ws.onerror = () => ws.close();
        ws.onclose = () => ws.close();
      } catch {}
    }
  }, [canRerun, firstRerunnable, rerunLoading, etlProps, selectedItem, getPuck]);

  return (
    <ActionBar label={label}>
      <ActionBar.Group>
        {parentAction}
        {label && <ActionBar.Label label={label} />}
      </ActionBar.Group>
      <ActionBar.Group>
        {canRerun && (
          <ActionBar.Action
            onClick={(e) => {
              e.stopPropagation();
              handleRerun();
            }}
            label="Rerun job"
            disabled={rerunLoading}
          >
            <RefreshCw size={16} style={rerunLoading ? { animation: "spin 1s linear infinite" } : undefined} />
          </ActionBar.Action>
        )}
        {children}
      </ActionBar.Group>
    </ActionBar>
  );
}
