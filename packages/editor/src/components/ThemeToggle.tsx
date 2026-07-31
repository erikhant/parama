import { Button, nextThemeMode, useTheme, type ThemeMode } from '@parama-ui/react';
import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react';
import { memo, useCallback } from 'react';

/** Icon and label for each mode, in cycle order. */
const MODE_PRESENTATION: Record<ThemeMode, { Icon: typeof SunIcon; label: string }> = {
  light: { Icon: SunIcon, label: 'Light' },
  dark: { Icon: MoonIcon, label: 'Dark' },
  system: { Icon: MonitorIcon, label: 'System' }
};

/**
 * Cycles the editor between light, dark and following the system preference.
 *
 * A three-state control cannot express its state through the icon alone —
 * "explicitly light" and "system, which currently resolves to light" would look
 * identical. The accessible name therefore always announces the mode, and the
 * title reveals what the next click does.
 */
export const ThemeToggle = memo(() => {
  const { mode, setMode } = useTheme();

  const handleClick = useCallback(() => setMode(nextThemeMode(mode)), [mode, setMode]);

  const { Icon, label } = MODE_PRESENTATION[mode];
  const nextLabel = MODE_PRESENTATION[nextThemeMode(mode)].label;

  return (
    <Button
      size="xs"
      variant="ghost"
      color="secondary"
      onClick={handleClick}
      aria-label={`Theme: ${label}. Switch to ${nextLabel}.`}
      title={`Theme: ${label}. Switch to ${nextLabel}.`}>
      <Icon size={16} />
    </Button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';
