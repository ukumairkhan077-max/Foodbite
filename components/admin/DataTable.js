// components/admin/DataTable.js
// Generic table — columns is [{ key, label }], rows is an array of objects.
export default function DataTable({ columns, rows, renderActions }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--color-border)", color: "var(--color-text-muted)", fontWeight: 600 }}>
              {col.label}
            </th>
          ))}
          {renderActions && <th style={{ borderBottom: "1px solid var(--color-border)" }} />}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={row._id || i}>
            {columns.map((col) => (
              <td key={col.key} style={{ padding: "10px 12px", borderBottom: "1px solid var(--color-border)" }}>
                {row[col.key]}
              </td>
            ))}
            {renderActions && <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--color-border)" }}>{renderActions(row)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
