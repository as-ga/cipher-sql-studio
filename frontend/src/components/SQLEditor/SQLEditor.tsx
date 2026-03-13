import Editor from "@monaco-editor/react";
import "./SQLEditor.scss";

interface Props {
  value: string;
  onChange: (val: string) => void;
  onRun: () => void;
  loading: boolean;
}

export default function SQLEditor({ value, onChange, onRun, loading }: Props) {
  return (
    <div className="sql-editor">
      <div className="sql-editor__header">
        <h4>SQL Editor</h4>
      </div>

      <div className="sql-editor__monaco">
        <Editor
          height="200px"
          defaultLanguage="sql"
          theme="vs-dark"
          value={value}
          onChange={(v) => onChange(v ?? "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
            padding: { top: 8 },
          }}
        />
      </div>

      <div className="sql-editor__actions">
        <button
          className="sql-editor__clear-btn"
          onClick={() => onChange("")}
          disabled={loading || !value}
        >
          Clear
        </button>
        <button
          className="sql-editor__run-btn"
          onClick={onRun}
          disabled={loading || !value.trim()}
        >
          {loading ? "Running..." : "▶ Run Query"}
        </button>
      </div>
    </div>
  );
}
