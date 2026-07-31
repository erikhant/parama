import { Button, Input } from '@parama-ui/react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { memo } from 'react';
import type { HeaderRow } from './headers';

interface HeadersTableProps {
  rows: HeaderRow[];
  onUpdate: (id: string, property: 'key' | 'value', value: string) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}

/** Editable key/value table for the request's HTTP headers. */
export const HeadersTable = memo<HeadersTableProps>(({ rows, onUpdate, onRemove, onAdd }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full">
      <thead>
        <tr>
          <th className="border border-stroke text-sm text-content p-2">Key</th>
          <th className="border border-stroke text-sm text-content p-2">Value</th>
          <th className="border border-stroke text-sm text-content p-2"></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td className="border border-stroke">
              <Input
                className="rounded-none shadow-none border-none focus-visible:ring-0"
                value={row.key}
                placeholder="Header name"
                aria-label="Header name"
                onChange={(event) => onUpdate(row.id, 'key', event.target.value)}
              />
            </td>
            <td className="border border-stroke">
              <Input
                className="rounded-none shadow-none border-none focus-visible:ring-0"
                value={row.value}
                placeholder="Header value"
                aria-label="Header value"
                onChange={(event) => onUpdate(row.id, 'value', event.target.value)}
              />
            </td>
            <td className="border border-stroke text-center">
              <Button
                variant="ghost"
                color="secondary"
                className="text-content-subtle"
                size="xs"
                aria-label="Remove header"
                onClick={() => onRemove(row.id)}>
                <Trash2Icon size={16} />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="flex justify-end mt-2">
      <Button variant="ghost" color="secondary" className="text-content" size="xs" onClick={onAdd}>
        <PlusIcon size={16} />
        Add row
      </Button>
    </div>
  </div>
));

HeadersTable.displayName = 'HeadersTable';
