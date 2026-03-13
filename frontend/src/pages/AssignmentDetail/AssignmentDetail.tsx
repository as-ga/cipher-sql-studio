import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import type {
  AssignmentDetail as AssignmentDetailType,
  QueryResult,
} from "@/types";
import SampleDataViewer from "@/components/SampleDataViewer/SampleDataViewer";
import SQLEditor from "@/components/SQLEditor/SQLEditor";
import ResultsPanel from "@/components/ResultsPanel/ResultsPanel";
import HintPanel from "@/components/HintPanel/HintPanel";
import "./AssignmentDetail.scss";

export default function AssignmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState<AssignmentDetailType | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [queryError, setQueryError] = useState("");

  useEffect(() => {
    if (!id) return;
    api
      .getAssignment(Number(id))
      .then((data) => {
        console.log("Fetched assignment detail:", data);
        setAssignment(data);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRunQuery = async () => {
    if (!query.trim() || !assignment) return;
    setQueryLoading(true);
    setQueryError("");
    setQueryResult(null);
    try {
      const result = await api.executeQuery(query, assignment.id);
      setQueryResult(result);
    } catch (e) {
      setQueryError(e instanceof Error ? e.message : "Query failed");
    } finally {
      setQueryLoading(false);
    }
  };

  if (loading)
    return <div className="assignment-detail__loading">Loading...</div>;
  if (error || !assignment)
    return (
      <div className="assignment-detail__error">{error || "Not found"}</div>
    );

  const schemaText = assignment.tables.map((t) => t.schema_sql).join("\n");

  return (
    <div className="assignment-detail">
      <button className="assignment-detail__back" onClick={() => navigate("/")}>
        ← Back to Assignments
      </button>

      {/* Question Panel */}
      <div className="assignment-detail__question">
        <div className="assignment-detail__question-top">
          <span
            className={`assignment-detail__question-badge assignment-detail__question-badge--${assignment.difficulty}`}
          >
            {assignment.difficulty}
          </span>
        </div>
        <h2>{assignment.title}</h2>
        <p className="assignment-detail__question-text">
          {assignment.question}
        </p>
      </div>

      {/* Two-column workspace */}
      <div className="assignment-detail__workspace">
        <div className="assignment-detail__left">
          <SampleDataViewer
            tables={assignment.tables}
            sampleData={assignment.sample_data}
          />
          <HintPanel
            question={assignment.question}
            query={query}
            schema={schemaText}
          />
        </div>

        <div className="assignment-detail__right">
          <SQLEditor
            value={query}
            onChange={setQuery}
            onRun={handleRunQuery}
            loading={queryLoading}
          />
          <ResultsPanel result={queryResult} error={queryError} />
        </div>
      </div>
    </div>
  );
}
