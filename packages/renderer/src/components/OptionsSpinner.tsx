import { Select, SelectContent, SelectItem, SelectTrigger } from '@parama-ui/react';
import { Loader2Icon } from 'lucide-react';

/**
 * Placeholder shown while a select-like field loads its remote options.
 *
 * Mirrors the real trigger's dimensions so the form does not shift when the
 * options arrive.
 */
export function OptionsSpinner() {
  return (
    <Select>
      <SelectTrigger className="w-full">
        <span className="flex items-center animate-spin">
          <Loader2Icon className="size-4 text-content-faint" />
        </span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none" className="text-content-faint">
          Loading options...
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
