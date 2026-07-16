import * as React from "react";
import type { IconProps } from "./Icon";

/** Searchable gallery grid for the library stories. Not part of the public API. */
export function IconGrid({
  icons,
}: {
  icons: Record<string, React.ComponentType<IconProps>>;
}) {
  const [q, setQ] = React.useState("");
  const entries = Object.entries(icons).filter(([name]) =>
    name.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <input
        placeholder="Filter icons…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ marginBottom: 16, padding: "6px 10px", width: 240 }}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: 16,
        }}
      >
        {entries.map(([name, Cmp]) => (
          <div
            key={name}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              padding: 16,
              border: "1px solid var(--border, #e5e5e5)",
              borderRadius: 8,
            }}
          >
            <Cmp size={40} title={name} />
            <code style={{ fontSize: 11, textAlign: "center" }}>{name}</code>
          </div>
        ))}
      </div>
    </div>
  );
}
