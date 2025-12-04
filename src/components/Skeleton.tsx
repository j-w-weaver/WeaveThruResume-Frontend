// src/components/Skeleton.tsx
// src/components/Skeleton.tsx
import type { CSSProperties } from "react";

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({
  width = "100%",
  height = "20px",
  borderRadius = "4px",
  className = "",
  style = {},
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}

// Specific skeleton components for different content types

export function SkeletonCard() {
  return (
    <div
      style={{
        background: "#161b26",
        border: "1px solid #2d3748",
        borderRadius: "10px",
        padding: "24px",
      }}
    >
      <Skeleton width="50%" height="24px" style={{ marginBottom: "12px" }} />
      <Skeleton width="80%" height="16px" style={{ marginBottom: "8px" }} />
      <Skeleton width="60%" height="16px" />
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div
      style={{
        background: "#161b26",
        border: "1px solid #2d3748",
        borderRadius: "10px",
        padding: "24px",
      }}
    >
      <Skeleton
        width="48px"
        height="48px"
        borderRadius="12px"
        style={{ marginBottom: "16px" }}
      />
      <Skeleton width="60px" height="40px" style={{ marginBottom: "8px" }} />
      <Skeleton width="100px" height="14px" />
    </div>
  );
}

export function SkeletonAnalysisCard() {
  return (
    <div
      style={{
        background: "#161b26",
        border: "1px solid #2d3748",
        borderRadius: "12px",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <Skeleton width="70px" height="70px" borderRadius="50%" />
      <div style={{ flex: 1 }}>
        <Skeleton width="60%" height="20px" style={{ marginBottom: "8px" }} />
        <div style={{ display: "flex", gap: "16px" }}>
          <Skeleton width="100px" height="14px" />
          <Skeleton width="120px" height="14px" />
          <Skeleton width="80px" height="14px" />
        </div>
      </div>
      <Skeleton width="40px" height="40px" borderRadius="8px" />
    </div>
  );
}

// For Resume/Job Lists
export function SkeletonListItem() {
  return (
    <div
      style={{
        padding: "20px",
        borderBottom: "1px solid #2d3748",
        display: "flex",
        alignItems: "center",
        gap: "20px",
      }}
    >
      {/* Icon */}
      <Skeleton width="48px" height="48px" borderRadius="8px" />

      {/* Content */}
      <div style={{ flex: 1 }}>
        <Skeleton width="60%" height="18px" style={{ marginBottom: "8px" }} />
        <div style={{ display: "flex", gap: "16px" }}>
          <Skeleton width="100px" height="14px" />
          <Skeleton width="80px" height="14px" />
          <Skeleton width="60px" height="14px" />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px" }}>
        <Skeleton width="40px" height="40px" borderRadius="8px" />
        <Skeleton width="40px" height="40px" borderRadius="8px" />
      </div>
    </div>
  );
}

// Complete list with multiple items
export function SkeletonList() {
  return (
    <div
      style={{
        background: "#161b26",
        border: "1px solid #2d3748",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <SkeletonListItem key={i} />
      ))}
    </div>
  );
}
