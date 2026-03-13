import type { QueryResult } from "@/types";
import "./ResultsPanel.scss";

interface Props {
  result: QueryResult | null;
  error: string;
}

export default function ResultsPanel({ result, error }: Props) {
  return (
    <div className="results-panel">
      <div className="results-panel__header">
        <h4>Results</h4>
        {result && <span>{result.rowCount} row(s)</span>}
      </div>

      {error && <div className="results-panel__error">{error}</div>}

      {!error && !result && (
        <div className="results-panel__empty">
          Run a query to see results here
        </div>
      )}

      {!error && result && result.fields.length > 0 && (
        <div className="results-panel__table-wrap">
          <table className="results-panel__table">
            <thead>
              <tr>
                {result.fields.map((f) => (
                  <th key={f}>{f}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, ri) => (
                <tr key={ri}>
                  {result.fields.map((f) => (
                    <td key={f}>{String(row[f] ?? "NULL")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
