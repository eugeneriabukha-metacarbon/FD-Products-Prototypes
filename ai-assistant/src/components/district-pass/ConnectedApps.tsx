import { PlugsIcon } from "@phosphor-icons/react";
import { Button } from "@financedistrict/apps-ui/button";
import { type ConnectedApp } from "./mockData";

export function ConnectedApps({
  apps,
  onRevoke,
}: {
  apps: ConnectedApp[];
  onRevoke: (app: ConnectedApp) => void;
}) {
  if (apps.length === 0) {
    return (
      <p className="body-03 text-primary-foreground-muted">
        No apps are using your District Pass.
      </p>
    );
  }

  return (
    <ul className="border-card-border flex flex-col border-t">
      {apps.map((app) => (
        <li
          key={app.id}
          className="border-card-border flex items-center gap-3 border-b py-3"
        >
          <span className="bg-brand-primary-background flex size-9 shrink-0 items-center justify-center rounded-sm">
            {app.icon ? (
              <img src={app.icon} alt="" className="size-5" />
            ) : (
              <PlugsIcon size={18} className="text-primary-foreground-muted" />
            )}
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-primary-foreground truncate text-sm font-medium">
              {app.name}
            </span>
            <span className="body-03 text-primary-foreground-muted truncate">
              {app.scope} · {app.connected}
            </span>
          </div>
          <Button
            variation="secondary"
            size="sm"
            type="button"
            aria-label={`Revoke access for ${app.name}`}
            onClick={() => onRevoke(app)}
          >
            Revoke
          </Button>
        </li>
      ))}
    </ul>
  );
}
