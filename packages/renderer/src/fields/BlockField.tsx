import type { BlockField as BlockFieldType } from '@parama-dev/form-builder-types';
import { cn } from '@parama-ui/react';
import { memo } from 'react';
import { useFormMode } from '../hooks/useFieldFlags';
import { columnSpanClass } from '../utils/responsiveClass';

/** Vertical rhythm unit, in pixels, that a block's `height` multiplies. */
const HEIGHT_UNIT_PX = 24;

/**
 * Presentational field: either a spacer or an HTML/React content block.
 *
 * Spacers are invisible in a live form and render a dashed outline in the
 * editor so authors can see and grab them.
 *
 * @remarks
 * String content is injected with `dangerouslySetInnerHTML`. Schemas are
 * authored content, so treat them as trusted input — sanitise before storing if
 * end users can supply block markup.
 */
export const BlockField = memo<{ field: BlockFieldType }>(({ field }) => {
  const mode = useFormMode();
  const className = cn(columnSpanClass(field));

  if (field.type === 'spacer') {
    const height = field.height || 2;

    return (
      <div className={className} style={{ height: `${height * HEIGHT_UNIT_PX}px` }}>
        {mode === 'editor' && (
          <div className="h-full bg-void border-2 border-dashed border-stroke-strong rounded-lg flex items-center justify-center">
            <span className="text-content-subtle text-sm">Spacer ({height} units)</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className} style={{ minHeight: field.height ? `${field.height * HEIGHT_UNIT_PX}px` : 'auto' }}>
      {typeof field.content === 'string' ? (
        <div className="min-h-full" dangerouslySetInnerHTML={{ __html: field.content }} />
      ) : (
        field.content
      )}
    </div>
  );
});

BlockField.displayName = 'BlockField';
