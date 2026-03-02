/**
 * ETL Execute Field - Execute button, response modal, listById
 * Same as framely ElementOptionsDropdown ETL UI
 */

import { useState, useCallback } from "react";
import { createUsePuck } from "@puckeditor/core";
import { fetchEtlList, fetchEtlListById } from "../api/etl.api";

const usePuck = createUsePuck();

interface EtlExecuteFieldProps {
  value: Record<string, unknown>[];
  onChange: (value: Record<string, unknown>[]) => void;
}

export function EtlExecuteField({ onChange }: EtlExecuteFieldProps) {
  const selectedItem = usePuck((s) => s.selectedItem);
  const parentProps = selectedItem?.type === "ETL" ? (selectedItem.props as Record<string, unknown>) : undefined;

  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<Record<string, unknown>[] | null>(null);
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);

  const apiEndpoint = (parentProps?.apiEndpoint as string)?.trim();
  const tenantName = (parentProps?.tenantName as string)?.trim();
  const useToken = (parentProps?.useToken as string) === "true";
  const request = ((parentProps?.request as string)?.trim().toUpperCase() || "POST") as "GET" | "POST";
  const body = (parentProps?.body as string)?.trim();

  const fetchListById = useCallback(
    async (selectedIndices: Set<number>) => {
      if (!response || selectedIndices.size === 0) return;
      const selectedIds = Array.from(selectedIndices)
        .map((i) => response[i]?.data_flow_id ?? response[i]?.entity_id)
        .filter((v) => v != null);
      if (selectedIds.length === 0) return;
      const selectKeys = response[0] ? Object.keys(response[0]).filter((k) => k !== "value") : [];
      const result = await fetchEtlListById({
        apiEndpoint: apiEndpoint || "https://api-dev.akashic.dhira.io/application/data_flow/list",
        tenantName,
        useToken,
        selectedIds: selectedIds as (string | number)[],
        selectKeys,
      });
      if (result.success && result.rows.length > 0) {
        onChange(result.rows);
        setResponseModalOpen(false);
      }
    },
    [response, apiEndpoint, tenantName, useToken, onChange]
  );

  const handleExecute = async (pageNumber?: number) => {
    const page = pageNumber ?? 1;
    const endpoint = apiEndpoint || "https://api-dev.akashic.dhira.io/application/data_flow/list";
    setExecuting(true);
    if (pageNumber === undefined) setResponse(null);
    setError(null);
    const result = await fetchEtlList({
      apiEndpoint: endpoint,
      tenantName,
      useToken,
      request,
      body,
      pageNumber: page,
    });
    setExecuting(false);
    if (result.success) {
      setResponse(result.rows);
      setSelectedRows(new Set());
      setCurrentPage(page);
      setTotalPages(result.totalPages);
      setResponseModalOpen(true);
    } else {
      let errMsg = result.error || "Request failed";
      if (errMsg.toLowerCase().includes("invalid access token")) {
        errMsg += ". The ETL API expects a Keycloak token. Set VITE_ETL_API_TOKEN in .env with your Akashic token, or try 'Use session token' = No.";
      }
      setError(errMsg);
    }
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1) return;
    if (totalPages != null && nextPage > totalPages) return;
    handleExecute(nextPage);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <button
        type="button"
        onClick={() => handleExecute()}
        disabled={executing}
        style={{
          padding: "8px 16px",
          fontSize: "14px",
          fontWeight: 500,
          borderRadius: "6px",
          border: "1px solid #3b82f6",
          background: "#3b82f6",
          color: "#fff",
          cursor: executing ? "not-allowed" : "pointer",
          opacity: executing ? 0.7 : 1,
        }}
      >
        {executing ? "Executing…" : "Execute"}
      </button>
      {error && (
        <div
          style={{
            fontSize: "14px",
            color: "#dc2626",
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #fecaca",
            backgroundColor: "#fef2f2",
          }}
        >
          {error}
        </div>
      )}
      {responseModalOpen && response && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
          onClick={() => setResponseModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "16px", borderBottom: "1px solid #e2e8f0", fontWeight: 600 }}>
              ETL Response
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
              {response.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f8fafc" }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", borderBottom: "1px solid #e2e8f0", width: "40px" }}>
                          <input
                            type="checkbox"
                            checked={response.length > 0 && selectedRows.size === response.length}
                            onChange={(e) => {
                              const next = e.target.checked ? new Set(response.map((_, i) => i)) : new Set<number>();
                              setSelectedRows(next);
                              if (next.size > 0) fetchListById(next);
                            }}
                          />
                        </th>
                        {response[0] && Object.keys(response[0]).map((k) => (
                          <th key={k} style={{ padding: "8px 12px", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
                            {k.replace(/_/g, " ")}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {response.map((row, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "8px 12px" }}>
                            <input
                              type="checkbox"
                              checked={selectedRows.has(i)}
                              onChange={(e) => {
                                e.stopPropagation();
                                const next = new Set(selectedRows);
                                if (next.has(i)) next.delete(i);
                                else next.add(i);
                                setSelectedRows(next);
                                if (next.size > 0) fetchListById(next);
                              }}
                            />
                          </td>
                          {response[0] && Object.keys(response[0]).map((k) => (
                            <td key={k} style={{ padding: "8px 12px" }}>
                              {row[k] !== null && row[k] !== undefined
                                ? typeof row[k] === "object"
                                  ? JSON.stringify(row[k])
                                  : String(row[k])
                                : "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: "#64748b" }}>No data to display</p>
              )}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px",
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || executing}
                  style={{
                    padding: "6px 12px",
                    fontSize: "13px",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    background: "#fff",
                    cursor: currentPage <= 1 || executing ? "not-allowed" : "pointer",
                  }}
                >
                  Previous
                </button>
                <span style={{ fontSize: "13px", color: "#64748b" }}>
                  Page {currentPage}
                  {totalPages != null ? ` of ${totalPages}` : ""}
                </span>
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={(totalPages != null && currentPage >= totalPages) || executing}
                  style={{
                    padding: "6px 12px",
                    fontSize: "13px",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    background: "#fff",
                    cursor: (totalPages != null && currentPage >= totalPages) || executing ? "not-allowed" : "pointer",
                  }}
                >
                  Next
                </button>
              </div>
              <button
                type="button"
                onClick={() => setResponseModalOpen(false)}
                style={{
                  padding: "6px 12px",
                  fontSize: "13px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
