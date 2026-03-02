/**
 * Superset API - same as framely
 * GET /api/superset/charts returns { success, charts, baseUrl }
 */

import { config } from "@/config";

export interface SupersetChart {
  id: number;
  slice_name: string;
  viz_type: string;
  description?: string;
  [key: string]: unknown;
}

export interface SupersetChartsResponse {
  success: boolean;
  charts?: SupersetChart[];
  baseUrl?: string;
  msg?: string;
}

function getToken(): string | null {
  return localStorage.getItem("token") || localStorage.getItem("auth_token");
}

export async function fetchSupersetCharts(): Promise<{
  success: boolean;
  charts: SupersetChart[];
  baseUrl: string;
}> {
  const token = getToken();
  const apiUrl = config.apiUrl.replace(/\/$/, "");
  const url = `${apiUrl}/superset/charts`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const json = (await res.json().catch(() => ({}))) as SupersetChartsResponse;

  if (!res.ok) {
    return { success: false, charts: [], baseUrl: "" };
  }

  if (json.success && json.charts && Array.isArray(json.charts)) {
    return {
      success: true,
      charts: json.charts,
      baseUrl: typeof json.baseUrl === "string" ? json.baseUrl.replace(/\/$/, "") : "",
    };
  }

  return { success: false, charts: [], baseUrl: "" };
}
