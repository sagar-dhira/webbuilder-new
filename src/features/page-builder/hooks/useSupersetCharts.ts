/**
 * Fetch Superset charts - backend allows optional auth (works with or without token)
 */

import { useEffect, useState } from "react";
import { fetchSupersetCharts, type SupersetChart } from "../api/superset.api";

export function useSupersetCharts() {
  const [charts, setCharts] = useState<SupersetChart[]>([]);
  const [baseUrl, setBaseUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchSupersetCharts()
      .then((res) => {
        if (res.success && res.charts && Array.isArray(res.charts)) {
          setCharts(res.charts);
          setBaseUrl(typeof res.baseUrl === "string" ? res.baseUrl : "");
        }
      })
      .catch(() => setError("Failed to load charts"))
      .finally(() => setLoading(false));
  }, []);

  return { charts, baseUrl, loading, error };
}
