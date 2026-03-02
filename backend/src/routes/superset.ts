import { Router } from "express";
import { optionalAuth } from "../middleware/auth.js";
import { fetchSupersetCharts, getSupersetBaseUrl } from "../services/superset.js";
import { logInfo } from "../lib/logger.js";

const router = Router();

/**
 * GET /api/superset/charts
 * Returns list of Superset charts. Uses optional auth - works without token (for webbuilder/dev).
 * Backend fetches from Superset using env credentials.
 */
router.get("/charts", optionalAuth, async (req, res) => {
  try {
    const charts = await fetchSupersetCharts();
    const baseUrl = getSupersetBaseUrl();

    logInfo("superset_charts", "User fetched Superset charts", { count: charts.length }, req.user?.userId ?? null);

    res.json({
      success: true,
      charts,
      baseUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch Superset charts";
    res.status(502).json({
      success: false,
      msg: message,
    });
  }
});

/**
 * GET /api/superset/config
 * Returns Superset base URL for embedding.
 */
router.get("/config", optionalAuth, (req, res) => {
  const baseUrl = getSupersetBaseUrl();
  res.json({ success: true, baseUrl });
});

export { router as supersetRoutes };
