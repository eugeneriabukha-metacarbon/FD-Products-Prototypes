import * as React from "react";
import { PlugsIcon } from "@phosphor-icons/react";
import { Button } from "@financedistrict/apps-ui/button";
import { CONNECTED_APPS, type ConnectedApp } from "./mockData";

export function ConnectedApps({
  onToast,
}: {
  onToast: (message: string) => void;
}) {
  const [apps, setApps] = React.useState<ConnectedApp[]>(CONNECTED_APPS);

  const revoke = (app: ConnectedApp) => {
    setApps((prev) => prev.filter((a) => a.id !== app.id));
    onToast(`Access revoked for ${app.name}.`);
  };

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
            onClick={() => revoke(app)}
          >
            Revoke
          </Button>
        </li>
      ))}
    </ul>
  );
}
