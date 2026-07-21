import { CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react";
import { FeatureCard } from "@financedistrict/apps-ui/feature-card";
import { ACTIVITY_EVENTS, type ActivityEvent } from "./mockData";

export function ActivityRow({ event }: { event: ActivityEvent }) {
  const Icon = event.status === "success" ? CheckCircleIcon : XCircleIcon;
  const color =
    event.status === "success"
      ? "text-success-primary-foreground"
      : "text-destructive-primary-foreground";
  return (
    <li className="border-card-border border-b last:border-b-0">
      <FeatureCard
        caret={false}
        leading={<Icon weight="fill" className={color} />}
        title={event.label}
        subtitle={`${event.device} · ${event.location}`}
        trailing={
          <span className="body-03 whitespace-nowrap">{event.time}</span>
        }
      />
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
