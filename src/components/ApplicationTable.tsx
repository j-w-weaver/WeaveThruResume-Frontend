import { useState, useMemo, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import type { Job, JobStatus } from "../types";
import "./applicationTable.css";

interface ApplicationTableProps {
  applications: Job[];
  onStatusChange: (id: number, newStatus: JobStatus) => void;
  onViewDetails: (application: Job) => void;
  onDelete: (id: number) => void;
}

type SortField = "jobTitle" | "companyName" | "appliedDate" | "status";
type SortDirection = "asc" | "desc";

const STATUS_OPTIONS: JobStatus[] = [
  "Interested",
  "Applied",
  "Interviewing",
  "Offer",
  "Rejected",
  "Withdrawn",
];

const STATUS_COLORS = {
  Interested: "#6B7280",
  Applied: "#3B82F6",
  Interviewing: "#F59E0B",
  Offer: "#10B981",
  Rejected: "#EF4444",
  Withdrawn: "#6B7280",
};

export function ApplicationTable({
  applications,
  onStatusChange,
  onViewDetails,
  onDelete,
}: ApplicationTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("appliedDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedApplications = useMemo(() => {
    let filtered = [...applications];

    if (searchQuery) {
      filtered = filtered.filter(
        (app) =>
          app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.companyName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "jobTitle":
          comparison = a.jobTitle.localeCompare(b.jobTitle);
          break;
        case "companyName":
          comparison = a.companyName.localeCompare(b.companyName);
          break;
        case "appliedDate":
          const dateA = a.appliedDate || a.createdAt;
          const dateB = b.appliedDate || b.createdAt;
          comparison = new Date(dateA).getTime() - new Date(dateB).getTime();
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [applications, searchQuery, statusFilter, sortField, sortDirection]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  return (
    <div className="application-table-container">
      <div className="application-table-filters">
        <div className="application-table-search">
          <input
            type="text"
            placeholder={
              isMobile ? "Search..." : "Search by job title or company..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="application-table-search-input"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="application-table-filter-select"
        >
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="application-table-results">
        Showing {filteredAndSortedApplications.length} of {applications.length}{" "}
        applications
      </div>

      <div className="application-table-wrapper">
        <table className="application-table">
          <thead>
            <tr>
              {!isMobile && (
                <th onClick={() => handleSort("jobTitle")} className="sortable">
                  Job Title {getSortIcon("jobTitle")}
                </th>
              )}
              <th
                onClick={() => handleSort("companyName")}
                className="sortable"
              >
                Company {getSortIcon("companyName")}
              </th>
              <th onClick={() => handleSort("status")} className="sortable">
                Status {getSortIcon("status")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedApplications.length === 0 ? (
              <tr>
                <td
                  colSpan={isMobile ? 3 : 4}
                  className="application-table-empty"
                >
                  <div className="application-table-empty-content">
                    <div className="application-table-empty-icon">🔍</div>
                    <p>No applications found</p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="btn btn-secondary btn-sm"
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedApplications.map((app) => {
                return (
                  <tr
                    key={app.id}
                    className="application-table-row"
                    onClick={() => onViewDetails(app)}
                  >
                    {!isMobile && (
                      <td className="application-table-job-title">
                        <strong>{app.jobTitle}</strong>
                      </td>
                    )}
                    <td>
                      {isMobile ? (
                        <div className="mobile-cell-content">
                          <div className="mobile-job-title">{app.jobTitle}</div>
                          <div className="mobile-company">
                            {app.companyName}
                          </div>
                        </div>
                      ) : (
                        app.companyName
                      )}
                    </td>
                    <td>
                      <select
                        value={app.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          onStatusChange(app.id, e.target.value as JobStatus);
                        }}
                        className="application-table-status-select"
                        style={{
                          borderColor: STATUS_COLORS[app.status],
                          color: STATUS_COLORS[app.status],
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {isMobile ? status.substring(0, 9) : status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="application-table-actions">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(app);
                          }}
                          className="application-table-action-btn"
                          title="View details"
                        >
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              window.confirm(
                                `Delete application for ${app.jobTitle} at ${app.companyName}?`
                              )
                            ) {
                              onDelete(app.id);
                            }
                          }}
                          className="application-table-action-btn danger"
                          title="Delete"
                        >
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
