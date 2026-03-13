import { useState } from "react";
import { api } from "@/services/api";
import "./HintPanel.scss";

interface Props {
  question: string;
  query: string;
  schema: string;
}

export default function HintPanel({ question, query, schema }: Props) {
  const [hints, setHints] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchHint = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getHint(question, query, schema);
      setHints((prev) => [...prev, res.hint]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to get hint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hint-panel">
      <div className="hint-panel__header">
        <h4>💡 Hint</h4>
      </div>

      {hints.map((h, i) => (
        <div key={i} className="hint-panel__content">
          <span className="hint-panel__label">Hint {i + 1}</span>
          {h}
        </div>
      ))}

      {error && <div className="hint-panel__error">{error}</div>}

      <button
        className="hint-panel__btn"
        onClick={fetchHint}
        disabled={loading}
      >
        {loading
          ? "Getting hint..."
          : hints.length
          ? "Get Another Hint"
          : "Get Hint"}
      </button>
    </div>
  );
}
