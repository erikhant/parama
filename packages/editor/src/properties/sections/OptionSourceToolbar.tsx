import type { ExternalDataSource, FieldGroupItem } from '@parama-dev/form-builder-types';
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Label
} from '@parama-ui/react';
import { PencilLineIcon, Plus } from 'lucide-react';
import { memo } from 'react';
import { ExternalDataOptions } from '../select/ExternalDataOptions';
import { useFieldSettings } from '../hooks/useFieldSettings';

type External = ExternalDataSource<FieldGroupItem> & { _refreshTimestamp?: number };

interface OptionSourceToolbarProps {
  /** True while no options, groups or API source are configured yet. */
  isUnconfigured: boolean;
  /** Groups are a select-only feature; omitted for multiselect and autocomplete. */
  supportsGroups: boolean;
  external?: External;
  onAddOption: () => void;
  onAddGroup: () => void;
  onExternalChange: (external: External) => void;
  onRemoveAll: () => void;
}

/**
 * The "Options" header row: choose where a field's choices come from, or clear
 * them.
 *
 * A field draws its options from exactly one of three sources — an inline list,
 * grouped lists, or a remote endpoint — so the picker is offered only while
 * none is configured. After that the row switches to a single "Remove all"
 * action.
 */
export const OptionSourceToolbar = memo<OptionSourceToolbarProps>(
  ({ isUnconfigured, supportsGroups, external, onAddOption, onAddGroup, onExternalChange, onRemoveAll }) => {
    const { isEditable } = useFieldSettings();

    return (
      <>
        <div className="flex justify-between items-center">
          <Label>Options</Label>

          {isEditable &&
            (isUnconfigured ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="xs" color="secondary" variant="ghost">
                    <Plus size={15} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-32" align="end">
                  <DropdownMenuItem onSelect={onAddOption}>List</DropdownMenuItem>
                  {supportsGroups && <DropdownMenuItem onSelect={onAddGroup}>Group list</DropdownMenuItem>}
                  <DropdownMenuItem asChild>
                    <ExternalDataOptions external={external} onChange={onExternalChange}>
                      <button className="dropdown-item w-full hover:bg-surface-sunken">API source</button>
                    </ExternalDataOptions>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                className="text-xs text-content-subtle"
                variant="ghost"
                size="xs"
                color="secondary"
                onClick={onRemoveAll}>
                Remove all
              </Button>
            ))}
        </div>

        {external?.url && (
          <div>
            <Label className="text-xs text-content-muted">API Source</Label>
            <div className="flex items-center space-x-2">
              <Badge size="sm">
                <p className="max-w-48 truncate">{external.url}</p>
              </Badge>
              {isEditable && (
                <ExternalDataOptions external={external} onChange={onExternalChange}>
                  <Button variant="ghost" size="xs" color="secondary" className="text-content-muted">
                    <span className="sr-only">Edit API source</span>
                    <PencilLineIcon size={15} />
                  </Button>
                </ExternalDataOptions>
              )}
            </div>
          </div>
        )}
      </>
    );
  }
);

OptionSourceToolbar.displayName = 'OptionSourceToolbar';
