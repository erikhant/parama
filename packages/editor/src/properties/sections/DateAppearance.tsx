import type { DateField } from '@parama-dev/form-builder-types';
import { FormItem, Label, Switch } from '@parama-ui/react';
import { memo, useState } from 'react';
import { useFieldSettings } from '../hooks/useFieldSettings';
import { SectionPanel } from '../SectionPanel';
import type { SectionProps } from './types';

/**
 * Appearance panel for date fields: whether the calendar caption offers month
 * and year dropdowns.
 *
 * The schema stores one `dropdownType` string covering both switches —
 * `dropdown` for both, `dropdown-months`, `dropdown-years`, or unset — so each
 * switch has to consult the other's state to compute the combined value.
 */
export const DateAppearance = memo<SectionProps<DateField>>(({ field, onChange }) => {
  const { isReadOnly } = useFieldSettings('appearanceSettings');

  const [enableSelectionMonth, setEnableSelectionMonth] = useState(
    () => field.options?.dropdownType !== undefined && field.options?.dropdownType !== 'dropdown-years'
  );

  const [enableSelectionYear, setEnableSelectionYear] = useState(
    () => field.options?.dropdownType !== undefined && field.options?.dropdownType !== 'dropdown-months'
  );

  return (
          <SectionPanel title="Appearance">
            <FormItem orientation="horizontal">
              <div className="form-captions !col-span-3">
                <Label htmlFor="enable-selection-month">Selection month</Label>
                <p className="form-description">Enable month selection</p>
              </div>
              <div className="col-span-2 flex items-center justify-end">
                <Switch
                  id="enable-selection-month"
                  disabled={isReadOnly}
                  checked={
                    field.options?.dropdownType !== undefined && field.options?.dropdownType !== 'dropdown-years'
                  }
                  onCheckedChange={(checked) => {
                    setEnableSelectionMonth(checked);
                    onChange({
                      options: {
                        ...field.options,
                        dropdownType:
                          enableSelectionYear && checked
                            ? 'dropdown'
                            : checked
                              ? 'dropdown-months'
                              : enableSelectionYear
                                ? 'dropdown-years'
                                : undefined
                      }
                    });
                  }}
                />
              </div>
            </FormItem>
            <FormItem orientation="horizontal">
              <div className="form-captions !col-span-3">
                <Label htmlFor="enable-selection-year">Selection year</Label>
                <p className="form-description">Enable year selection</p>
              </div>
              <div className="col-span-2 flex items-center justify-end">
                <Switch
                  id="enable-selection-year"
                  disabled={isReadOnly}
                  checked={
                    field.options?.dropdownType !== undefined && field.options?.dropdownType !== 'dropdown-months'
                  }
                  onCheckedChange={(checked) => {
                    setEnableSelectionYear(checked);
                    onChange({
                      options: {
                        ...field.options,
                        dropdownType:
                          enableSelectionMonth && checked
                            ? 'dropdown'
                            : checked
                              ? 'dropdown-years'
                              : enableSelectionMonth
                                ? 'dropdown-months'
                                : undefined
                      }
                    });
                  }}
                />
              </div>
            </FormItem>
          </SectionPanel>
  );
});

DateAppearance.displayName = 'DateAppearance';
