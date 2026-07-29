import { Input, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@parama-ui/react';
import { HelpCircleIcon } from 'lucide-react';
import { memo } from 'react';
import { MAPPER_FIELDS, type MapperFieldDef, type MapperKey } from './mapper';

// `key` is consumed by React for reconciliation and never reaches props, so the
// field's identity is passed under a different name.
interface MapperRowProps extends Omit<MapperFieldDef, 'key'> {
  fieldKey: MapperKey;
  value: string;
  onChange: (key: MapperKey, value: string) => void;
}

/** One mapper row: a fixed property name, its help tooltip, and the path input. */
const MapperRow = memo<MapperRowProps>(({ fieldKey, label, hint, placeholder, value, onChange }) => (
  <tr>
    <td className="border">
      <div className="flex items-center gap-2 pr-2">
        <Input
          className="rounded-none shadow-none border-none focus-visible:ring-0"
          value={label}
          placeholder={label}
          readOnly
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-gray-600">
                <HelpCircleIcon size={15} />
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-64 mr-2" side="top">
              <p className="form-description text-gray-700 leading-relaxed">{hint}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </td>
    <td className="border">
      <Input
        className="rounded-none shadow-none border-none focus-visible:ring-0"
        value={value}
        placeholder={placeholder}
        aria-label={label}
        onChange={(event) => onChange(fieldKey, event.target.value)}
      />
    </td>
  </tr>
));

MapperRow.displayName = 'MapperRow';

interface MapperTableProps {
  /** Reads the currently configured path for a mapper key. */
  readValue: (key: MapperKey) => string;
  onChange: (key: MapperKey, value: string) => void;
  /** False until a response or an existing mapping gives the author something to map. */
  hasSomethingToMap: boolean;
}

/**
 * Maps an API response onto the option shape the form expects.
 *
 * Hidden until there is either a probe result or a saved mapping — without a
 * response to look at, there is no way to know what the paths should be.
 */
export const MapperTable = memo<MapperTableProps>(({ readValue, onChange, hasSomethingToMap }) => {
  if (!hasSomethingToMap) {
    return <p className="bg-gray-50 border p-5 rounded text-gray-500 text-center text-sm">No mapping yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <p className="text-blue-700 leading-relaxed text-sm my-2 p-3 bg-blue-100 rounded border border-blue-200">
        <strong>Note:</strong> The mapper is used to transform the response data into a format suitable for use in the
        select options. <br />
      </p>

      <table className="min-w-full">
        <thead>
          <tr>
            <th className="border text-sm text-gray-700 p-2">Property</th>
            <th className="border text-sm text-gray-700 p-2">Target source</th>
          </tr>
        </thead>
        <tbody>
          {MAPPER_FIELDS.map(({ key, ...field }) => (
            <MapperRow key={key} fieldKey={key} {...field} value={readValue(key)} onChange={onChange} />
          ))}
        </tbody>
      </table>
    </div>
  );
});

MapperTable.displayName = 'MapperTable';
