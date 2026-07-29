import * as LucideIcons from 'lucide-react';
import { memo } from 'react';

type LucideComponent = React.ComponentType<{ size?: number }>;

/**
 * Renders a Lucide icon by name.
 *
 * Field schemas reference icons as plain strings, so the lookup has to happen
 * at runtime. Unknown names render nothing rather than throwing, because a
 * schema authored against a newer icon set must not break the form.
 */
export const Icon = memo<{ name: string; size?: number }>(({ name, size = 15 }) => {
  const Component = (LucideIcons as unknown as Record<string, LucideComponent>)[name];
  return Component ? <Component size={size} /> : null;
});

Icon.displayName = 'Icon';
