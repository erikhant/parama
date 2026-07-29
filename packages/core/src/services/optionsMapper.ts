import type { ExternalDataSource, FieldGroupItem } from '@parama-dev/form-builder-types';
import { get as getObject } from 'lodash-es';
import { v4 as uuid } from 'uuid';
import { logger } from '../logger';

type OptionMapper = ExternalDataSource<FieldGroupItem>['mapper'];

/** Property names probed, in order, when no explicit mapper is configured. */
const LABEL_KEYS = ['label', 'name', 'title', 'text', 'display', 'id', 'key', 'value'] as const;
const VALUE_KEYS = ['value', 'id', 'key', 'name'] as const;
const ID_KEYS = ['id', 'key', 'value'] as const;

function firstDefined(item: Record<string, any>, keys: readonly string[]): any {
  for (const key of keys) {
    if (item[key]) return item[key];
  }
  return undefined;
}

/** Maps a primitive response entry (string/number/boolean) to an option. */
function fromPrimitive(item: unknown): FieldGroupItem {
  const text = String(item);
  return { id: uuid(), label: text, value: text };
}

/** Maps an object response entry using an explicit mapper configuration. */
function fromMappedObject(item: Record<string, any>, mapper: NonNullable<OptionMapper>, index: number): FieldGroupItem {
  const { dataMapper } = mapper;
  return {
    id: getObject(item, dataMapper.id as any) || uuid(),
    label:
      getObject(item, dataMapper.label as any) || getObject(item, dataMapper.value as any) || `Option ${index + 1}`,
    value: getObject(item, dataMapper.value as any) || getObject(item, dataMapper.id as any) || `option-${index}`
  };
}

/** Maps an object response entry by probing conventional property names. */
function fromInferredObject(item: Record<string, any>, index: number): FieldGroupItem {
  const id = firstDefined(item, ID_KEYS) ?? index;
  const label = firstDefined(item, LABEL_KEYS) ?? `Option ${index + 1}`;
  const value = firstDefined(item, VALUE_KEYS) ?? index;

  return { id: String(id), label: String(label), value: String(value) };
}

/**
 * Extracts the option array out of an arbitrary API response.
 *
 * @param data - Raw parsed response body
 * @param mapper - Optional `dataSource` path plus id/label/value field mapping
 * @returns Normalised options; an empty array if the response cannot be read
 */
export function mapResponseToOptions(data: any, mapper: OptionMapper): FieldGroupItem[] {
  try {
    let sourceData = mapper?.dataSource ? getObject(data, mapper.dataSource, data) : data;

    if (!Array.isArray(sourceData)) {
      logger.warn('Response data is not an array, wrapping in array');
      sourceData = [sourceData];
    }

    return sourceData.map((item: any, index: number): FieldGroupItem => {
      if (typeof item === 'object' && item !== null) {
        return mapper?.dataMapper ? fromMappedObject(item, mapper, index) : fromInferredObject(item, index);
      }
      return fromPrimitive(item);
    });
  } catch (error) {
    logger.error('Error mapping response to options:', error);
    return [];
  }
}
