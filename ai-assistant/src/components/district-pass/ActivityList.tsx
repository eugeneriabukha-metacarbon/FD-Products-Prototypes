import * as React from "react";
import {
  CaretLeftIcon,
  CaretRightIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { Button } from "@financedistrict/apps-ui/button";
import { FeatureCard } from "@financedistrict/apps-ui/feature-card";
import { ACTIVITY_EVENTS, type ActivityEvent } from "./mockData";

const PAGE_SIZE = 10;

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

/**
 * Full auth activity log, newest first, paginated at 10 per page. Footer per
 * Figma 578:45964: centered `‹ 1 – 10 of N ›` — ghost icon caret buttons
 * (disabled side goes muted via the DS Button disabled state) around a
 * body-03 range counter.
 */
export function ActivityList() {
  const [page, setPage] = React.useState(0);
  const pageCount = Math.ceil(ACTIVITY_EVENTS.length / PAGE_SIZE);
  const start = page * PAGE_SIZE;
  const events = ACTIVITY_EVENTS.slice(start, start + PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col">
        {events.map((event) => (
          <ActivityRow key={event.id} event={event} />
        ))}
      </ul>

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variation="ghost"
            size="sm"
            iconOnly
            type="button"
            aria-label="Previous page"
            disabled={page === 0}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
          >
            <CaretLeftIcon />
          </Button>
          <p
            aria-live="polite"
            className="body-03 text-primary-foreground text-center"
          >
            {start + 1} – {start + events.length} of {ACTIVITY_EVENTS.length}
          </p>
          <Button
            variation="ghost"
            size="sm"
            iconOnly
            type="button"
            aria-label="Next page"
            disabled={page === pageCount - 1}
            onClick={() =>
              setPage((current) => Math.min(pageCount - 1, current + 1))
            }
          >
            <CaretRightIcon />
          </Button>
        </div>
      )}
    </div>
  );
}
