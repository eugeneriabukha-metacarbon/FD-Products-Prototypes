import { CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react";
import { ACTIVITY_EVENTS, type ActivityEvent } from "./mockData";

export function ActivityRow({ event }: { event: ActivityEvent }) {
  const Icon = event.status === "success" ? CheckCircleIcon : XCircleIcon;
  const color =
    event.status === "success"
      ? "text-success-primary-foreground"
      : "text-destructive-primary-foreground";
  return (
    <li className="border-card-border flex items-center gap-3 border-b py-3 last:border-b-0">
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

/** Full auth activity log — every `ACTIVITY_EVENTS` entry, newest first. */
export function ActivityList() {
  return (
    <ul className="flex flex-col">
      {ACTIVITY_EVENTS.map((event) => (
        <ActivityRow key={event.id} event={event} />
      ))}
    </ul>
  );
}
