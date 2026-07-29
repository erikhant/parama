/**
 * Pure helpers for the `FormData` instance that backs file fields.
 *
 * `FormData` has a mutating API, which made the previous store code update file
 * state in place — subscribers never saw a new reference and immutability was
 * violated. Every helper here returns a *new* `FormData`, so store updates stay
 * referentially honest.
 */

/** Shallow-copies a FormData instance. */
export function cloneFormData(source: FormData): FormData {
  const next = new FormData();
  source.forEach((value, key) => next.append(key, value));
  return next;
}

/** Returns a copy of `source` with every entry under `key` removed. */
export function withoutKey(source: FormData, key: string): FormData {
  const next = new FormData();
  source.forEach((value, entryKey) => {
    if (entryKey !== key) next.append(entryKey, value);
  });
  return next;
}

/** Returns a copy of `source` where `key` holds exactly `files`. */
export function withFiles(source: FormData, key: string, files: File[]): FormData {
  const next = withoutKey(source, key);
  files.forEach((file) => next.append(key, file));
  return next;
}

/** Reads every `File` stored under `key`. */
export function readFiles(source: FormData, key: string): File[] {
  const files: File[] = [];
  source.forEach((value, entryKey) => {
    if (entryKey === key && value instanceof File) files.push(value);
  });
  return files;
}

/** True when the FormData holds at least one entry. */
export function hasEntries(source: FormData): boolean {
  let found = false;
  source.forEach(() => {
    found = true;
  });
  return found;
}

/**
 * Normalises whatever a caller passed as a file field value into a File list.
 * Accepts a single `File`, an array of files, or nothing.
 */
export function toFileList(value: unknown): File[] {
  if (Array.isArray(value)) return value.filter((item): item is File => item instanceof File);
  if (value instanceof File) return [value];
  return [];
}
