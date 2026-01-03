import { Button, Select } from '@ui/kit';
import { createSignal } from 'solid-js';
import { switchTheme, getTheme } from '~/lib/theme-engine';

export function ThemeSwitcher() {
  const [theme, setTheme] = createSignal(getTheme());

  const handleThemeChange = (newTheme: string) => {
    switchTheme(newTheme as any);
    setTheme(newTheme as any);
  };

  return (
    <Select
      label="Theme"
      options={[
        { value: 'default', label: 'Default (Blue)' },
        { value: 'tenant-1', label: 'Orange Theme' },
        { value: 'tenant-2', label: 'Green Theme' },
        { value: 'custom', label: 'Purple Theme' },
      ]}
      value={theme()}
      onChange={handleThemeChange}
    />
  );
}
