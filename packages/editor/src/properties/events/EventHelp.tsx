import { HelperTooltip } from '../../components/HelperTooltip';

/**
 * Explains what events do and how expressions work.
 *
 * Declared at module scope rather than inside the panel: a component defined in
 * a render body gets a new identity every render, which makes React unmount and
 * remount it — closing the tooltip mid-hover.
 */
export const EventHelp = () => (
  <HelperTooltip className="max-w-xs">
    Events are triggered when a field's value changes and validation is successful.
    <br />
    <br />
    <b>Types of events:</b>
    <br />• <code>setValue</code>: Set a value in the target field
    <br />• <code>reset</code>: Reset the target field to its default value
    <br />• <code>fetch</code>: Refresh dynamic options for the target field
    <br />
    <br />
    Use <code>{`{{fieldName}}`}</code> to reference other field values in the value parameter.
  </HelperTooltip>
);

EventHelp.displayName = 'EventHelp';
