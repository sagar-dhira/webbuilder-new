import { httpClient } from "@/shared/services/http";

export interface SupersetChart {
  id: number;
  slice_name: string;
  viz_type: string;
  description?: string;
}

export interface SupersetChartsResponse {
  success: boolean;
  charts?: SupersetChart[];
  baseUrl?: string;
}

export async function fetchSupersetCharts(): Promise<{
  charts: SupersetChart[];
  baseUrl: string;
}> {
  const res = await httpClient.get<SupersetChartsResponse>("/superset/charts");
  const data = res.data;
  if (!data?.success || !Array.isArray(data.charts)) {
    throw new Error(data?.msg ?? "Failed to load Superset charts");
  }
  const baseUrl =
    typeof data.baseUrl === "string" && data.baseUrl.trim()
      ? data.baseUrl.replace(/\/$/, "")
      : "http://localhost:3001";
  return { charts: data.charts, baseUrl };
}
