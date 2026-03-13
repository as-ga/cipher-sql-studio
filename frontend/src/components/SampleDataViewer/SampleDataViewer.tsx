import { useState } from "react";
import type { AssignmentTable, AssignmentSampleData } from "@/types";
import "./SampleDataViewer.scss";

interface Props {
  tables: AssignmentTable[];
  sampleData: AssignmentSampleData[];
}

export default function SampleDataViewer({ tables, sampleData }: Props) {
  const [activeTab, setActiveTab] = useState(0);

  if (tables.length === 0) {
    return (
      <div className="sample-data">
        <div className="sample-data__empty">No sample tables available</div>
      </div>
    );
  }

  const currentTable = tables[activeTab];
  const currentData = sampleData.find(
    (s) => s.table_name == currentTable.table_name
  );
  const columns = currentTable?.columns || [];
  const rows = currentData?.rows || [];

  return (
    <div className="sample-data">
      <div className="sample-data__header">
        <h4>Sample Data</h4>
      </div>
      {tables.length > 1 && (
        <div className="sample-data__tabs">
          {tables.map((t, i) => (
            <button
              key={t.id}
              className={`sample-data__tab ${
                i === activeTab ? "sample-data__tab--active" : ""
              }`}
              onClick={() => setActiveTab(i)}
            >
              {t.table_name}
            </button>
          ))}
        </div>
      )}
      <div className="sample-data__table-wrap">
        <table className="sample-data__table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.columnName}>
                  {c.columnName}
                  <span
                    style={{ opacity: 0.5, marginLeft: 4, fontSize: "0.65rem" }}
                  >
                    {c.dataType}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center" }}>
                  No data
                </td>
              </tr>
            ) : (
              rows.map((row, ri) => (
                <tr key={ri}>
                  {columns.map((c) => (
                    <td key={c.columnName}>
                      {String(row[c.columnName] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
