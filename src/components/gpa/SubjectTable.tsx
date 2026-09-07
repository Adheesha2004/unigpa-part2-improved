import { useState } from "react";
import {
  GRADE_SCALE,
  gradePoints,
  subjectPoints,
  totalCredits,
  totalPoints,
  type GradeLetter,
  type Subject,
} from "@/lib/gpa";
import { ConfirmDialog } from "@/components/gpa/ConfirmDialog";

interface Props {
  subjects: Subject[];
  onUpdate: (id: string, patch: Partial<Omit<Subject, "id">>) => void;
  onDelete: (id: string) => void;
}

const inputClass =
  "w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary";

export function SubjectTable({ subjects, onUpdate, onDelete }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftCredits, setDraftCredits] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Subject | null>(null);

  function confirmDelete() {
    if (pendingDelete) {
      onDelete(pendingDelete.id);
      setPendingDelete(null);
    }
  }

  function startEdit(subject: Subject) {
    setEditingId(subject.id);
    setDraftName(subject.name);
    setDraftCredits(String(subject.credits));
  }

  function saveEdit(subject: Subject) {
    const credits = Number(draftCredits);
    if (draftName.trim() && !Number.isNaN(credits) && credits > 0 && credits <= 30) {
      onUpdate(subject.id, { name: draftName.trim(), credits });
    }
    setEditingId(null);
  }

  if (subjects.length === 0) {
    return (
      <div className="card-elevated p-8 text-center">
        <p className="text-4xl">📚</p>
        <h2 className="mt-2 text-base font-semibold">No subjects yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your first subject above to start calculating your GPA.
        </p>
      </div>
    );
  }

  return (
    <div className="card-elevated overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4 pb-1">
        <h2 className="text-base font-semibold text-primary">Your subjects</h2>
        <span className="text-xs text-muted-foreground">
          points = credits × grade value
        </span>
      </div>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-2 font-medium">Subject</th>
              <th className="px-3 py-2 font-medium">Credits</th>
              <th className="px-3 py-2 font-medium">Grade</th>
              <th className="px-3 py-2 text-right font-medium">Points</th>
              <th className="px-5 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {subjects.map((subject) => {
              const editing = editingId === subject.id;
              return (
                <tr key={subject.id} className="transition-colors hover:bg-accent/40">
                  <td className="px-5 py-3 font-medium">
                    {editing ? (
                      <input
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        className={inputClass}
                        aria-label="Subject name"
                      />
                    ) : (
                      subject.name
                    )}
                  </td>
                  <td className="px-3 py-3 figure">
                    {editing ? (
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={draftCredits}
                        onChange={(e) => setDraftCredits(e.target.value)}
                        className={inputClass}
                        aria-label="Credits"
                      />
                    ) : (
                      subject.credits
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <select
                      value={subject.grade}
                      onChange={(e) =>
                        onUpdate(subject.id, { grade: e.target.value as GradeLetter })
                      }
                      className="rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                      aria-label={`Grade for ${subject.name}`}
                    >
                      {GRADE_SCALE.map((g) => (
                        <option key={g.letter} value={g.letter}>
                          {g.letter} — {g.points.toFixed(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3 text-right figure">
                    {subjectPoints(subject).toFixed(1)}
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({gradePoints(subject.grade).toFixed(1)})
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1.5">
                      {editing ? (
                        <>
                          <button
                            onClick={() => saveEdit(subject)}
                            className="rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(subject)}
                            className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-muted-foreground ring-1 ring-border transition-colors hover:bg-muted hover:text-foreground"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setPendingDelete(subject)}
                            className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-destructive ring-1 ring-destructive/30 transition-colors hover:bg-destructive/10"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t bg-accent/30 text-xs">
              <td className="px-5 py-2.5 font-medium text-muted-foreground">Totals</td>
              <td className="px-3 py-2.5 font-semibold figure">{totalCredits(subjects)}</td>
              <td className="px-3 py-2.5"></td>
              <td className="px-3 py-2.5 text-right font-semibold figure">
                {totalPoints(subjects).toFixed(1)}
              </td>
              <td className="px-5 py-2.5"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
