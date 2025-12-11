import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatDistanceToNow } from "date-fns";
import type { Job, JobStatus } from "../types";
import "./applicationKanban.css";

interface ApplicationKanbanProps {
  applications: Job[];
  onStatusChange: (id: number, newStatus: JobStatus) => void;
  onViewDetails: (application: Job) => void;
  showArchived: boolean;
}

const ACTIVE_STATUSES: JobStatus[] = [
  "Interested",
  "Applied",
  "Interviewing",
  "Offer",
];
const ARCHIVED_STATUSES: JobStatus[] = ["Rejected", "Withdrawn"];

const STATUS_CONFIG = {
  Interested: { color: "#6B7280", icon: "👀" },
  Applied: { color: "#3B82F6", icon: "📤" },
  Interviewing: { color: "#F59E0B", icon: "🎤" },
  Offer: { color: "#10B981", icon: "🎉" },
  Rejected: { color: "#EF4444", icon: "❌" },
  Withdrawn: { color: "#6B7280", icon: "🚫" },
};

interface KanbanCardProps {
  application: Job;
  onViewDetails: (application: Job) => void;
  isDragging?: boolean;
}

function KanbanCard({
  application,
  onViewDetails,
  isDragging = false,
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: application.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  const displayDate = application.appliedDate || application.createdAt;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`kanban-card ${
        isDragging || isSortableDragging ? "dragging" : ""
      }`}
      onClick={() => onViewDetails(application)}
    >
      <div className="kanban-card-header">
        <h4>{application.jobTitle}</h4>
      </div>
      <div className="kanban-card-company">🏢 {application.companyName}</div>
      <div className="kanban-card-date">
        📅{" "}
        {formatDistanceToNow(new Date(displayDate), {
          addSuffix: true,
        })}
      </div>
      {application.interviewDate && (
        <div className="kanban-card-interview">
          🎤 Interview:{" "}
          {new Date(application.interviewDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

interface DroppableColumnProps {
  status: JobStatus;
  applications: Job[];
  onViewDetails: (application: Job) => void;
}

function DroppableColumn({
  status,
  applications,
  onViewDetails,
}: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = STATUS_CONFIG[status];

  return (
    <div className="kanban-column">
      <div
        className="kanban-column-header"
        style={{ borderTopColor: config.color }}
      >
        <span className="kanban-column-icon">{config.icon}</span>
        <h3>{status}</h3>
        <span className="kanban-column-count">{applications.length}</span>
      </div>

      <SortableContext
        id={status}
        items={applications.map((app) => app.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={`kanban-column-content ${isOver ? "dragging-over" : ""}`}
          style={{
            minHeight: "200px", // Ensure droppable area has height
          }}
        >
          {applications.length === 0 && (
            <div className="kanban-empty">No applications</div>
          )}

          {applications.map((app) => (
            <KanbanCard
              key={app.id}
              application={app}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export function ApplicationKanban({
  applications,
  onStatusChange,
  onViewDetails,
  showArchived,
}: ApplicationKanbanProps) {
  const [activeId, setActiveId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    console.log("🎯 DRAG START:", event.active.id);
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    console.log("🎯 DRAG END:", {
      activeId: event.active.id,
      overId: event.over?.id,
      hasOver: !!event.over,
    });

    const { active, over } = event;

    if (!over) {
      console.log("⚠️ No drop target - card will snap back");
      setActiveId(null);
      return;
    }

    const applicationId = active.id as number;
    const newStatus = over.id as JobStatus;

    console.log("📊 Attempting status change:", { applicationId, newStatus });

    const application = applications.find((app) => app.id === applicationId);

    if (!application) {
      console.log("❌ Application not found:", applicationId);
      setActiveId(null);
      return;
    }

    console.log(
      "📌 Current status:",
      application.status,
      "→ New status:",
      newStatus
    );

    if (application.status !== newStatus) {
      console.log("✅ Status changed, calling onStatusChange");
      onStatusChange(applicationId, newStatus);
    } else {
      console.log("⚠️ Status unchanged, no API call needed");
    }

    setActiveId(null);
  };

  const getApplicationsByStatus = (status: JobStatus) => {
    return applications.filter((app) => app.status === status);
  };

  const displayStatuses = showArchived
    ? [...ACTIVE_STATUSES, ...ARCHIVED_STATUSES]
    : ACTIVE_STATUSES;

  const activeApplication = activeId
    ? applications.find((app) => app.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        {displayStatuses.map((status) => (
          <DroppableColumn
            key={status}
            status={status}
            applications={getApplicationsByStatus(status)}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>

      <DragOverlay>
        {activeApplication ? (
          <KanbanCard
            application={activeApplication}
            onViewDetails={() => {}}
            isDragging={true}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
