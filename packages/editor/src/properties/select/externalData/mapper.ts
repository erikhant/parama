import type { ExternalDataSource, FieldGroupItem } from '@parama-dev/form-builder-types';

type Source = ExternalDataSource<FieldGroupItem>;

/** The option properties a response can be mapped onto. */
export type MapperProperty = 'id' | 'label' | 'value' | 'description';

/** Everything the mapper table can edit: the array path plus each property. */
export type MapperKey = 'dataSource' | MapperProperty;

export interface MapperFieldDef {
  key: MapperKey;
  label: string;
  hint: string;
  placeholder: string;
}

/**
 * The mapper table's rows, in display order.
 *
 * Five rows previously existed as five ~40-line copies of the same markup —
 * a read-only label, a help tooltip and an input — differing only in the text
 * and which part of the mapper they wrote. Describing them as data collapses
 * the table into one row component.
 */
export const MAPPER_FIELDS: MapperFieldDef[] = [
  {
    key: 'dataSource',
    label: 'Source',
    hint: 'The key in the response object that contains the array of items you want to map.',
    placeholder: "e.g. 'data' or 'items' in response"
  },
  {
    key: 'id',
    label: 'ID',
    hint: 'The unique identifier for each item in the array.',
    placeholder: "e.g. 'id' or 'key' in response"
  },
  {
    key: 'label',
    label: 'Label',
    hint: 'The text that will be displayed in the option list.',
    placeholder: "e.g. 'name' or 'title' in response"
  },
  {
    key: 'value',
    label: 'Value',
    hint: 'The value that will be submitted when the option is selected.',
    placeholder: "e.g. 'value' or 'id' in response"
  },
  {
    key: 'description',
    label: 'Description (optional)',
    hint: 'An optional field that can be used to provide additional information about the option.',
    placeholder: "e.g. 'description' or 'info' in response"
  }
];

/**
 * Writes one mapper field, leaving the rest of the source untouched.
 *
 * `dataSource` sits beside `dataMapper` rather than inside it, so the two cases
 * write to different levels of the object — the reason every call site
 * previously rebuilt the whole `mapper` literal by hand.
 */
export function withMapperField(source: Source, key: MapperKey, value: string): Source {
  const dataSource = source.mapper?.dataSource ?? '';
  const dataMapper = source.mapper?.dataMapper ?? ({} as FieldGroupItem);

  if (key === 'dataSource') {
    return { ...source, mapper: { dataSource: value, dataMapper } };
  }

  return { ...source, mapper: { dataSource, dataMapper: { ...dataMapper, [key]: value } as FieldGroupItem } };
}

/** Reads one mapper field, defaulting to an empty string. */
export function readMapperField(source: Source, key: MapperKey): string {
  if (key === 'dataSource') return source.mapper?.dataSource ?? '';

  const mapped = source.mapper?.dataMapper?.[key];
  return mapped === undefined || mapped === null ? '' : String(mapped);
}

/**
 * Accepts an absolute http(s) URL pointing at a resolvable host.
 *
 * Deliberately narrower than the browser's own URL parser: `localhost` and the
 * loopback address are allowed by name, but any other single-label host is
 * rejected, since a bare word is far more likely to be a half-typed domain than
 * an intentional target.
 */
const API_URL_PATTERN = /^(https?:\/\/)(localhost|127\.0\.0\.1|([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(:\d+)?(\/.*)?$/;

/** True when `url` is a usable API endpoint. */
export function isValidApiUrl(url: string): boolean {
  return API_URL_PATTERN.test(url);
}
