import { CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react";
import { Button } from "@financedistrict/apps-ui/button";
import { ACTIVITY_EVENTS, type ActivityEvent } from "./mockData";

const PREVIEW_COUNT = 4;

export function ActivityRow({ event }: { event: ActivityEvent }) {
  const Icon = event.status === "success" ? CheckCircleIcon : XCircleIcon;
  const color =
    event.status === "success"
      ? "text-success-primary-foreground"
      : "text-destructive-primary-foreground";
  return (
    <li className="border-card-border flex items-center gap-3 border-b py-3">
      <Icon
        size={18}
        weight="fill"
        className={`shrink-0 ${color}`}
        aria-hidden="true"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-primary-foreground truncate text-sm font-medium">
          {event.label}
        </span>
        <span className="body-03 text-primary-foreground-muted truncate">
          {event.device} · {event.location}
        </span>
      </div>
      <span className="body-03 text-primary-foreground-muted shrink-0">
        {event.time}
      </span>
    </li>
  );
}

export function SecurityActivity({ onViewAll }: { onViewAll: () => void }) {
  const preview = ACTIVITY_EVENTS.slice(0, PREVIEW_COUNT);
  return (
    <div className="flex flex-col gap-4">
      <ul className="border-card-border flex flex-col border-t">
        {preview.map((event) => (
          <ActivityRow key={event.id} event={event} />
        ))}
      </ul>
      <div>
        <Button
          variation="secondary"
          size="sm"
          type="button"
          onClick={onViewAll}
        >
          View all activity
        </Button>
      </div>
    </div>
  );
}
