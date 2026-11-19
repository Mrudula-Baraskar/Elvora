import { EmptyState } from "./StateViews";

export function DataTable({ columns, rows, keyField = "_id", emptyTitle }) {
  if (!rows?.length) return <EmptyState title={emptyTitle ?? "No records found"} />;
  return (
    <div className="overflow-x-auto">
      <div className="table-grid">
        <div className="table-row bg-muted/60" style={{ "--cols": columns.map((column) => column.width ?? "1fr").join(" ") }}>
          {columns.map((column) => (
            <div className="table-cell text-xs font-semibold uppercase tracking-wide text-muted-foreground" key={column.key}>
              {column.label}
            </div>
          ))}
        </div>
        {rows.map((row) => (
          <div className="table-row bg-background" key={row[keyField] ?? JSON.stringify(row)} style={{ "--cols": columns.map((column) => column.width ?? "1fr").join(" ") }}>
            {columns.map((column) => (
              <div className="table-cell" key={column.key}>
                {column.render ? column.render(row) : row[column.key] ?? "—"}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
