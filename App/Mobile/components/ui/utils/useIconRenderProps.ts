export type UseIconRenderInput = {
  className?: string;
  size?: unknown;
  height?: number | string;
  width?: number | string;
  baseClassName: (className?: string) => string;
  buildClassName: (className?: string) => string;
};

export function useIconRenderProps({
  className,
  size,
  height,
  width,
  baseClassName,
  buildClassName,
}: UseIconRenderInput) {
  if (typeof size === 'number') {
    return {
      iconProps: {
        className: baseClassName(className),
        size: size as number,
      },
    } as const;
  }
  if ((height !== undefined || width !== undefined) && size === undefined) {
    return {
      iconProps: {
        className: baseClassName(className),
      },
    } as const;
  }
  return {
    iconProps: {
      className: buildClassName(className),
    },
  } as const;
}
