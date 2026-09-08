import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { GRADE_SCALE, type GradeLetter, type Subject } from "@/lib/gpa";

interface Props {
  onAdd: (subject: Omit<Subject, "id">) => void;
  existingNames: string[];
}

export function SubjectForm({ onAdd, existingNames }: Props) {
  const [name, setName] = useState("");
  const [credits, setCredits] = useState("");
  const [grade, setGrade] = useState<GradeLetter>("A");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a subject name.");
      return;
    }
    // Reject numeric-only names like "12345" — a subject name must contain letters/words.
    if (!/[A-Za-zÀ-ÿ\u0600-\u06FF]/.test(trimmed)) {
      setError("Subject name must contain letters, not just numbers.");
      return;
    }
    // Prevent duplicate subjects — match case-insensitively, ignoring
    // extra spaces so "Linear Algebra" and "linear  algebra" are the same.
    const normalized = trimmed.toLowerCase().replace(/\s+/g, " ").trim();
    if (existingNames.some((n) => n.toLowerCase().replace(/\s+/g, " ").trim() === normalized)) {
      setError("This subject has already been added!");
      return;
    }
    const creditValue = Number(credits);
    if (!credits || Number.isNaN(creditValue) || creditValue < 1 || creditValue > 8) {
      setError("Credits must be between 1 and 8.");
      return;
    }
    if (!GRADE_SCALE.some((g) => g.letter === grade)) {
      setError("Please choose a valid grade.");
      return;
    }
    onAdd({ name: trimmed, credits: creditValue, grade });
    setName("");
    setCredits("");
    setGrade("A");
    setError(null);
    toast.success("Subject added successfully!", {
      description: `${trimmed} · ${creditValue} credits · ${grade}`,
    });
  }

  const inputClass =
    "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/30 focus:border-primary";

  return (
    <form onSubmit={handleSubmit} className="card-elevated p-5 sm:p-6">
      <h2 className="text-base font-semibold text-primary">Add a subject</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_110px_130px]">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">
            Subject name
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. Linear Algebra"
            className={inputClass}
            maxLength={80}
            aria-invalid={!!error}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">
            Credits
          </span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
            placeholder="4"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">
            Grade
          </span>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value as GradeLetter)}
            className={inputClass}
          >
            {GRADE_SCALE.map((g) => (
              <option key={g.letter} value={g.letter}>
                {g.letter} — {g.points.toFixed(1)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive animate-pop">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 active:translate-y-0"
      >
        Add subject
      </button>
    </form>
  );
}
