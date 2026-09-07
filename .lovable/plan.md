# Save your subjects automatically

Right now UniGPA starts from the same three sample subjects every time and forgets everything on refresh. This change makes the app remember your data in the browser.

## What changes for you

- Every subject you add, edit or delete is saved instantly in your browser.
- The "Calculated" state and your GPA summary are saved too, so a refresh brings back the same result card rather than resetting it.
- First-time visitors still see the three sample subjects; once you make any change, your own list replaces them permanently.
- A "Clear all" action lets you wipe saved data and start fresh.
- Nothing is uploaded anywhere — it stays on your device.

## Technical notes

- Add `src/hooks/use-local-storage.ts`: a generic `useLocalStorage<T>(key, initial)` hook that reads once after hydration (inside `useEffect`, not in the `useState` initializer, to avoid SSR hydration mismatches), then writes on every change.
- Storage keys: `unigpa.subjects.v1` and `unigpa.calculated.v1`, stored as JSON.
- On load, validate the parsed value: must be an array of objects with string `id`/`name`, numeric `credits`, and a grade present in the grade map from `src/lib/gpa.ts`. Invalid or corrupt JSON is discarded and the sample seed is used.
- In `src/routes/index.tsx`, replace the two `useState` calls with the hook; leave `addSubject`, `updateSubject`, `deleteSubject` logic unchanged.
- GPA, total credits and total points remain derived values computed from the restored subjects — no separate persisted copy, so they can never drift out of sync.
- Add a small "Clear all" button next to Calculate GPA that empties the list and removes both keys.
- Guard all storage access in try/catch so private-mode or disabled storage degrades to in-memory state.
