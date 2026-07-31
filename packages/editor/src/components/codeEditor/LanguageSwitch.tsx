import { Button, Separator, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@parama-ui/react';
import { memo } from 'react';
import { LANGUAGE_ICONS, LANGUAGE_LABELS, type SupportedLanguage } from './languages';

interface LanguageSwitchProps {
  languages: SupportedLanguage[];
  current: SupportedLanguage;
  disabled: boolean;
  size?: 'xs' | 'sm';
  onChange: (language: SupportedLanguage) => void;
}

/**
 * Icon toggles for switching the editor's language.
 *
 * Renders nothing when there is only one language on offer — a toggle with a
 * single option is just decoration.
 *
 * Declared at module scope: defined inside the editor's render body, as it was
 * before, React saw a new component type on every render and remounted the
 * whole row, closing any open tooltip.
 */
export const LanguageSwitch = memo<LanguageSwitchProps>(({ languages, current, disabled, size = 'xs', onChange }) => {
  if (languages.length <= 1) return null;

  return (
    <div className="flex items-center gap-1">
      {languages.map((language, index) => {
        const Icon = LANGUAGE_ICONS[language];

        return (
          <div key={language} className="flex items-center gap-1">
            {index > 0 && <Separator className="bg-stroke-strong h-4 w-[1px]" orientation="vertical" />}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size={size}
                    variant={current === language ? 'outline' : 'ghost'}
                    color="secondary"
                    className="flex items-center gap-1"
                    disabled={disabled}
                    aria-label={LANGUAGE_LABELS[language]}
                    onClick={() => onChange(language)}>
                    <Icon size={12} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="form-description text-content leading-relaxed">{LANGUAGE_LABELS[language]}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      })}
    </div>
  );
});

LanguageSwitch.displayName = 'LanguageSwitch';
