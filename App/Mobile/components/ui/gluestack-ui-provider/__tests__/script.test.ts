import { script } from '../script';

describe('gluestack script', () => {
  const originalMatchMedia = window.matchMedia;
  const originalError = console.error;

  afterEach(() => {
    // reset DOM classes and styles
    document.documentElement.className = '';
    document.documentElement.style.colorScheme = '' as any;
    window.matchMedia = originalMatchMedia as any;
    console.error = originalError;
  });

  it('applies system theme via matchMedia and sets colorScheme', () => {
  (window as any).matchMedia = (query: string) => ({ matches: query.includes('dark') });

    script('system');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect((document.documentElement.style as any).colorScheme).toBe('dark');

    // Now simulate prefers light
  (window as any).matchMedia = (_query: string) => ({ matches: false });
    document.documentElement.className = '';
    document.documentElement.style.colorScheme = '' as any;
    script('system');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect((document.documentElement.style as any).colorScheme).toBe('light');
  });

  it('applies explicit dark and light modes', () => {
    script('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect((document.documentElement.style as any).colorScheme).toBe('light');

    script('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect((document.documentElement.style as any).colorScheme).toBe('dark');
  });

  it('handles errors gracefully and logs them', () => {
    // Remove matchMedia to cause getSystemColorMode to throw when called
  (window as any).matchMedia = undefined;
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    script('system');
    expect(spy).toHaveBeenCalled();
  });
});
