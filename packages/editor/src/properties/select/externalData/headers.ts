/**
 * Editing model for an external data source's HTTP headers.
 *
 * The schema stores headers as a plain `Record<string, string>`, but a table
 * needs stable row identity — a map keyed by header name loses its row the
 * moment the author starts renaming it. These functions convert between the two
 * shapes and keep the row list immutable.
 */

export interface HeaderRow {
  id: string;
  key: string;
  value: string;
}

let sequence = 0;

/** Row ids only have to be unique within one editing session. */
const nextRowId = (): string => {
  sequence += 1;
  return `header-${sequence}`;
};

/** Expands a stored header map into editable rows. */
export function toHeaderList(headers: Record<string, string> | undefined): HeaderRow[] {
  return Object.entries(headers ?? {}).map(([key, value]) => ({ id: nextRowId(), key, value }));
}

/**
 * Collapses rows back into the stored map.
 *
 * Rows with a blank name are dropped: they are normal while the author is still
 * typing, and emitting them would put an unnamed header on the request.
 */
export function toHeaderMap(rows: HeaderRow[]): Record<string, string> {
  return rows.reduce<Record<string, string>>((headers, row) => {
    if (row.key.trim()) headers[row.key] = row.value;
    return headers;
  }, {});
}

/** Appends a blank row for the author to fill in. */
export function addHeaderRow(rows: HeaderRow[]): HeaderRow[] {
  return [...rows, { id: nextRowId(), key: '', value: '' }];
}

/** Changes one property of the row with the given id. */
export function updateHeaderRow(
  rows: HeaderRow[],
  id: string,
  property: 'key' | 'value',
  value: string
): HeaderRow[] {
  return rows.map((row) => (row.id === id ? { ...row, [property]: value } : row));
}

/** Removes the row with the given id. */
export function removeHeaderRow(rows: HeaderRow[], id: string): HeaderRow[] {
  return rows.filter((row) => row.id !== id);
}
