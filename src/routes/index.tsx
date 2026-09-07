import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  GRADE_SCALE,
  calculateGpa,
  newId,
  totalCredits,
  totalPoints,
  type Subject,
} from "@/lib/gpa";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { SubjectForm } from "@/components/gpa/SubjectForm";
import { SubjectTable } from "@/components/gpa/SubjectTable";
import { GpaResultCard } from "@/components/gpa/GpaResultCard";
import { WhatIfPanel } from "@/components/gpa/WhatIfPanel";
import { GradeReference } from "@/components/gpa/GradeReference";
import { ExportReport } from "@/components/gpa/ExportReport";
import { ConfirmDialog } from "@/components/gpa/ConfirmDialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UniGPA – Student GPA Calculator & Planner" },
      {
        name: "description",
        content:
          "UniGPA helps university students calculate their weighted GPA, plan semesters, and project What-If grade scenarios — all in the browser.",
      },
      { property: "og:title", content: "UniGPA – Student GPA Calculator & Planner" },
      {
        property: "og:description",
        content:
          "Add subjects, credits and grades to calculate your weighted GPA and explore What-If scenarios. Free, private, client-side.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const SUBJECTS_KEY = "unigpa.subjects.v1";
const CALCULATED_KEY = "unigpa.calculated.v1";

const SEED_SUBJECTS: Subject[] = [
  { id: newId(), name: "Calculus II", credits: 4, grade: "A-" },
  { id: newId(), name: "Data Structures", credits: 4, grade: "B+" },
  { id: newId(), name: "Physics 101", credits: 3, grade: "A" },
];

const GRADES = new Set<string>(GRADE_SCALE.map((g) => g.letter));

function isSubjectList(value: unknown): value is Subject[] {
  return (
    Array.isArray(value) &&
    value.every((s) => {
      if (typeof s !== "object" || s === null) return false;
      const o = s as Record<string, unknown>;
      return (
        typeof o["id"] === "string" &&
        typeof o["name"] === "string" &&
        typeof o["credits"] === "number" &&
        Number.isFinite(o["credits"]) &&
        typeof o["grade"] === "string" &&
        GRADES.has(o["grade"] as string)
      );
    })
  );
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function Index() {
  const [subjects, setSubjects, subjectsStore] = useLocalStorage<Subject[]>(
    SUBJECTS_KEY,
    SEED_SUBJECTS,
    isSubjectList
  );
  const [calculated, setCalculated, calculatedStore] = useLocalStorage<boolean>(
    CALCULATED_KEY,
    false,
    isBoolean
  );
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  function clearAll() {
    setSubjects([]);
    setCalculated(false);
    subjectsStore.clear();
    calculatedStore.clear();
    setConfirmClearOpen(false);
  }

  const gpa = calculateGpa(subjects);
  const credits = totalCredits(subjects);
  const points = totalPoints(subjects);

  function addSubject(subject: Omit<Subject, "id">) {
    setSubjects((prev) => [...prev, { ...subject, id: newId() }]);
    setCalculated(false);
  }

  function updateSubject(id: string, patch: Partial<Omit<Subject, "id">>) {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
    setCalculated(false);
  }

  function deleteSubject(id: string) {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setCalculated(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-gold font-display text-lg font-bold text-gold-foreground">
              U
            </div>
            <div>
              <p className="font-display text-lg font-semibold leading-tight">
                UniGPA
              </p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-primary-foreground/60">
                Student GPA Calculator & Planner
              </p>
            </div>
          </div>
          <span className="hidden items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium sm:flex">
            <span className="size-1.5 rounded-full bg-gold" />
            Calculated locally — no account needed
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 animate-rise">
          <div>
            <h1 className="text-3xl font-semibold sm:text-4xl">
              Your semester, calculated.
            </h1>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">
              Add subjects with credits and grades, calculate your weighted GPA,
              then test What-If scenarios before results are final.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setConfirmClearOpen(true)}
              disabled={subjects.length === 0}
              className="rounded-xl border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear all
            </button>
            <button
              onClick={() => setCalculated(true)}
              disabled={subjects.length === 0}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
            >
              Calculate GPA
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="space-y-6 lg:col-span-2">
            <SubjectForm onAdd={addSubject} />
            <SubjectTable
              subjects={subjects}
              onUpdate={updateSubject}
              onDelete={deleteSubject}
            />
          </section>

          <aside className="space-y-6">
            <GpaResultCard
              gpa={gpa}
              subjectCount={subjects.length}
              totalPoints={points}
              calculated={calculated}
            />
            <ExportReport subjects={subjects} gpa={gpa} />
            <div className="grid grid-cols-2 gap-4">
              <div className="card-elevated p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Total credits
                </p>
                <p className="figure mt-1 text-3xl font-semibold">{credits}</p>
              </div>
              <div className="card-elevated p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Subjects
                </p>
                <p className="figure mt-1 text-3xl font-semibold">
                  {subjects.length}
                </p>
              </div>
            </div>
            <WhatIfPanel subjects={subjects} currentGpa={gpa} />
            <GradeReference />
          </aside>
        </div>

        <footer className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
          UniGPA runs entirely in your browser. GPA = Σ(credits × grade points) ÷ Σcredits.
        </footer>
      </main>
    </div>
  );
}
