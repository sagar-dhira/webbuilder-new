/**
 * Same as framely ComponentsTab - Layout, Widget (Superset Charts), ETL tabs
 */

import { useState } from "react";
import { Drawer } from "@puckeditor/core";
import { BarChart3, Database } from "lucide-react";
import { useSupersetCharts } from "../hooks/useSupersetCharts";
import type { Config } from "@puckeditor/core";
import type { SupersetChart } from "../api/superset.api";

interface SidebarWithTabsProps {
  children: React.ReactNode;
  config: Config;
}

export function SidebarWithTabs({ children, config }: SidebarWithTabsProps) {
  const [activeTab, setActiveTab] = useState<"layout" | "widget" | "etl">("layout");
  const { charts: supersetCharts, baseUrl: supersetBaseUrl, loading: supersetLoading, error: supersetError } = useSupersetCharts();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minWidth: "260px",
      }}
    >
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #e2e8f0",
          backgroundColor: "#f8fafc",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("layout")}
          style={{
            flex: 1,
            padding: "12px 16px",
            fontSize: "14px",
            fontWeight: 500,
            border: "none",
            background: activeTab === "layout" ? "#fff" : "transparent",
            color: activeTab === "layout" ? "#1e293b" : "#64748b",
            cursor: "pointer",
            borderBottom: activeTab === "layout" ? "2px solid #1e293b" : "2px solid transparent",
          }}
        >
          Layout
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("widget")}
          style={{
            flex: 1,
            padding: "12px 16px",
            fontSize: "14px",
            fontWeight: 500,
            border: "none",
            background: activeTab === "widget" ? "#fff" : "transparent",
            color: activeTab === "widget" ? "#1e293b" : "#64748b",
            cursor: "pointer",
            borderBottom: activeTab === "widget" ? "2px solid #1e293b" : "2px solid transparent",
          }}
        >
          Widget
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("etl")}
          style={{
            flex: 1,
            padding: "12px 16px",
            fontSize: "14px",
            fontWeight: 500,
            border: "none",
            background: activeTab === "etl" ? "#fff" : "transparent",
            color: activeTab === "etl" ? "#1e293b" : "#64748b",
            cursor: "pointer",
            borderBottom: activeTab === "etl" ? "2px solid #1e293b" : "2px solid transparent",
          }}
        >
          ETL
        </button>
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        {activeTab === "layout" ? (
          children
        ) : activeTab === "etl" ? (
          <div style={{ padding: "16px" }}>
            <h4
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "#64748b",
                marginBottom: "12px",
              }}
            >
              Data
            </h4>
            <Drawer>
              <Drawer.Item
                name="ETL"
                label="Extract Load and Transform (ETL)"
                children={({ children: itemChildren }) => (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "16px",
                      backgroundColor: "#f8fafc",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      cursor: "grab",
                      minHeight: "80px",
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
                        backgroundColor: "#f1f5f9",
                      }}
                    >
                      <Database size={24} style={{ color: "#64748b" }} />
                    </div>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#334155",
                        textAlign: "center",
                      }}
                    >
                      {itemChildren}
                    </span>
                  </div>
                )}
              />
            </Drawer>
          </div>
        ) : (
          <div style={{ padding: "16px" }}>
            <h4
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "#64748b",
                marginBottom: "12px",
              }}
            >
              Superset Charts
            </h4>
            {supersetLoading ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "16px",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                <span style={{ animation: "spin 1s linear infinite" }}>⏳</span>
                Loading charts...
              </div>
            ) : supersetError ? (
              <div
                style={{
                  padding: "16px",
                  color: "#dc2626",
                  fontSize: "14px",
                }}
              >
                {supersetError}
              </div>
            ) : supersetCharts.length === 0 ? (
              <div
                style={{
                  padding: "16px",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                {supersetBaseUrl ? "No charts found. Create charts in Superset first." : "Log in to load Superset charts."}
              </div>
            ) : (
              <Drawer>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {supersetCharts.map((chart: SupersetChart) => {
                    const componentName = `SupersetChart_${chart.id}`;
                    if (!(componentName in config.components)) return null;
                    return (
                      <Drawer.Item
                        key={chart.id}
                        name={componentName}
                        label={chart.slice_name}
                        children={({ children: itemChildren }) => (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "8px",
                              padding: "16px",
                              backgroundColor: "#f8fafc",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                              cursor: "grab",
                              minHeight: "80px",
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
                                backgroundColor: "#f1f5f9",
                              }}
                            >
                              <BarChart3 size={24} style={{ color: "#64748b" }} />
                            </div>
                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: 500,
                                color: "#334155",
                                textAlign: "center",
                              }}
                            >
                              {itemChildren}
                            </span>
                          </div>
                        )}
                      />
                    );
                  })}
                </div>
              </Drawer>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
