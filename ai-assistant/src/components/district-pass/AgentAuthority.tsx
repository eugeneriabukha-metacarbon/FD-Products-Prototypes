import { Button } from "@financedistrict/apps-ui/button";
import { type AgentAuthorization } from "./mockData";

export function AgentAuthority({
  agents,
  onRevoke,
}: {
  agents: AgentAuthorization[];
  onRevoke: (agent: AgentAuthorization) => void;
}) {
  if (agents.length === 0) {
    return (
      <p className="body-03 text-primary-foreground-muted">
        No agents are authorized.
      </p>
    );
  }

  return (
    <ul className="border-card-border flex flex-col border-t">
      {agents.map((agent) => (
        <li
          key={agent.id}
          className="border-card-border flex items-center gap-3 border-b py-3"
        >
          <span className="bg-brand-primary-background flex size-9 shrink-0 items-center justify-center rounded-sm">
            <img src={agent.icon} alt="" className="size-5" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-primary-foreground truncate text-sm font-medium">
                {agent.name}
              </span>
              <span className="text-success-primary-foreground inline-flex items-center gap-1 text-xs font-medium">
                <span className="bg-success-primary-foreground size-1.5 rounded-full" />
                Active
              </span>
            </div>
            <span className="body-03 text-primary-foreground-muted truncate">
              {agent.scope}
            </span>
            <span className="font-mono text-xs text-primary-foreground-muted">
              {agent.spendUsed} / {agent.spendCap} this month · {agent.expires}
            </span>
          </div>
          <Button
            variation="secondary"
            size="sm"
            type="button"
            aria-label={`Revoke ${agent.name}`}
            onClick={() => onRevoke(agent)}
          >
            Revoke
          </Button>
        </li>
      ))}
    </ul>
  );
}
