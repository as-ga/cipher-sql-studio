import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import type { Assignment } from "@/types";
import "./AssignmentList.scss";

export default function AssignmentList() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api
      .getAssignments()
      .then(setAssignments)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="assignment-list__loading">Loading assignments...</div>
    );
  if (error) return <div className="assignment-list__error">{error}</div>;

  return (
    <div className="assignment-list">
      <div className="assignment-list__header">
        <h1>SQL Assignments</h1>
        <p>Practice SQL queries against real-world scenarios</p>
      </div>

      <div className="assignment-list__grid">
        {assignments.map((a) => (
          <div
            key={a.id}
            className="assignment-card"
            onClick={() => navigate(`/assignment/${a.id}`)}
          >
            <div className="assignment-card__top">
              <span
                className={`assignment-card__badge assignment-card__badge--${a.difficulty}`}
              >
                {a.difficulty}
              </span>
              <span className="assignment-card__id">#{a.id}</span>
            </div>
            <h3 className="assignment-card__title">{a.title}</h3>
            <p className="assignment-card__desc">{a.description}</p>
            <div className="assignment-card__footer">
              {new Date(a.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
