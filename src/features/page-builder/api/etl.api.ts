/**
 * ETL API - same as framely-rebuilt
 * Calls external ETL API (api-dev.akashic.dhira.io)
 * list, listById, run_immediate_job + WebSocket for job monitoring
 */

const DEFAULT_ETL_API_URL =
  import.meta.env.VITE_ETL_API_URL || "https://api-dev.akashic.dhira.io/application/data_flow/list";
const DEFAULT_ETL_TENANT = import.meta.env.VITE_ETL_TENANT_NAME || "tenanta";
const DEFAULT_ETL_BODY = (): string => {
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

export const ETL_DEFAULT_BODY = DEFAULT_ETL_BODY;

export interface EtlListParams {
  apiEndpoint: string;
  tenantName?: string;
  useToken?: boolean;
  request?: string;
  body?: string;
  pageNumber?: number;
}

export interface EtlListByIdParams {
  apiEndpoint: string;
  tenantName?: string;
  useToken?: boolean;
  selectedIds: (string | number)[];
  selectKeys: string[];
}

export interface EtlRunJobParams {
  apiEndpoint: string;
  tenantName?: string;
  useToken?: boolean;
  sessionId: string;
}

function getToken(): string | null {
  // ETL API (api-dev.akashic.dhira.io) expects Keycloak token, not framely JWT.
  // Use VITE_ETL_API_TOKEN when set (Akashic/Keycloak token); else fall back to session token.
  const etlToken = import.meta.env.VITE_ETL_API_TOKEN;
  if (typeof etlToken === "string" && etlToken.trim()) return etlToken.trim();
  return localStorage.getItem("access_token") || localStorage.getItem("token") || localStorage.getItem("auth_token");
}

function getHeaders(tenantName?: string, useToken?: boolean): Record<string, string> {
  const headers: Record<string, string> = { accept: "*/*", "Content-Type": "application/json" };
  if (useToken) {
    const token = getToken();
    if (token?.trim()) headers["Authorization"] = `Bearer ${token.trim()}`;
  }
  if (tenantName?.trim()) headers["tenantname"] = tenantName.trim();
  return headers;
}

function getBaseUrl(endpoint: string): string {
  return endpoint?.trim().replace(/\/list\/?$/, "").replace(/\/$/, "") || "";
}

/** Normalize API response to rows array */
export function normalizeToRows(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) {
    const ok = data.every((x) => typeof x === "object" && x !== null && !Array.isArray(x));
    if (ok) return data as Record<string, unknown>[];
    return [{ value: data }];
  }
  if (typeof data === "object" && data !== null) {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.result)) return o.result as Record<string, unknown>[];
    if (Array.isArray(o.data)) return o.data as Record<string, unknown>[];
    if (Array.isArray(o.rows)) return o.rows as Record<string, unknown>[];
    if (Array.isArray(o.items)) return o.items as Record<string, unknown>[];
    if (typeof o.data === "object" && o.data !== null) {
      const nested = o.data as Record<string, unknown>;
      if (Array.isArray(nested.result)) return nested.result as Record<string, unknown>[];
    }
    return [o];
  }
  return [{ value: data }];
}

/** Fetch ETL list (data flow list) */
export async function fetchEtlList(params: EtlListParams): Promise<{
  success: boolean;
  rows: Record<string, unknown>[];
  totalPages: number | null;
  error?: string;
}> {
  const {
    apiEndpoint,
    tenantName = DEFAULT_ETL_TENANT,
    useToken = true,
    request = "POST",
    body,
    pageNumber = 1,
  } = params;
  const endpoint = apiEndpoint?.trim() || DEFAULT_ETL_API_URL;
  const method = (request?.trim().toUpperCase() || "POST") as RequestInit["method"];
  let bodyStr = body?.trim() || DEFAULT_ETL_BODY();
  if (bodyStr && (method === "POST" || method === "PUT" || method === "PATCH")) {
    try {
      const parsed = JSON.parse(bodyStr) as Record<string, unknown>;
      bodyStr = JSON.stringify({ ...parsed, page_number: pageNumber });
    } catch {
      // keep original
    }
  }
  try {
    const res = await fetch(endpoint, {
      method: method || "GET",
      headers: getHeaders(tenantName, useToken),
      ...(bodyStr && (method === "POST" || method === "PUT" || method === "PATCH") ? { body: bodyStr } : {}),
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      const msg =
        (data.message as string) || (data.msg as string) || `Request failed (${res.status})`;
      return { success: false, rows: [], totalPages: null, error: msg };
    }
    const rows = normalizeToRows(data);
    const pagination = data.pagination as Record<string, unknown> | undefined;
    const total =
      (data.total_pages as number) ??
      (data.totalPages as number) ??
      (data.total_pages_count as number) ??
      (pagination?.total_pages as number) ??
      (pagination?.totalPages as number);
    return {
      success: true,
      rows,
      totalPages: typeof total === "number" ? total : null,
    };
  } catch (err) {
    return {
      success: false,
      rows: [],
      totalPages: null,
      error: err instanceof Error ? err.message : "Request failed",
    };
  }
}

/** Fetch ETL listById (detail by ids) */
export async function fetchEtlListById(params: EtlListByIdParams): Promise<{
  success: boolean;
  rows: Record<string, unknown>[];
  error?: string;
}> {
  const { apiEndpoint, tenantName = DEFAULT_ETL_TENANT, useToken = true, selectedIds, selectKeys } = params;
  const baseUrl = getBaseUrl(apiEndpoint) || "https://api-dev.akashic.dhira.io/application/data_flow";
  const listByIdUrl = `${baseUrl}/listById`;
  if (selectedIds.length === 0) return { success: false, rows: [] };
  const body = {
    where_key: ["data_flow_id"],
    where_value: selectedIds.length === 1 ? [selectedIds[0]] : selectedIds,
    select_keys: selectKeys,
  };
  try {
    const res = await fetch(listByIdUrl, {
      method: "POST",
      headers: getHeaders(tenantName, useToken),
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    const rows = Array.isArray(data.Response) ? data.Response : Array.isArray(data.response) ? data.response : [];
    return { success: true, rows: rows as Record<string, unknown>[] };
  } catch (err) {
    return {
      success: false,
      rows: [],
      error: err instanceof Error ? err.message : "Request failed",
    };
  }
}

/** Run ETL job immediately (rerun) */
export async function runEtlImmediateJob(params: EtlRunJobParams): Promise<{
  success: boolean;
  error?: string;
}> {
  const { apiEndpoint, tenantName = DEFAULT_ETL_TENANT, useToken = true, sessionId } = params;
  const baseUrl =
    apiEndpoint?.replace(/\/data_flow\/list\/?$/, "") || "https://api-dev.akashic.dhira.io/application";
  const runJobUrl = `${baseUrl}/job/ETL/run_immediate_job`;
  try {
    const res = await fetch(runJobUrl, {
      method: "POST",
      headers: getHeaders(tenantName, useToken),
      body: JSON.stringify({ session_id: sessionId }),
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      const msg = (data.message as string) || (data.msg as string) || "Failed to rerun job";
      return { success: false, error: msg };
    }
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

/** WebSocket URL for job monitoring */
export const ETL_WS_URL = "wss://api-dev.akashic.dhira.io/websocket/job_monitoring_channel";
