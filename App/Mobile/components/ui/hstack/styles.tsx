import { tva } from '@gluestack-ui/utils/nativewind-utils';

export const hstackStyle = tva({
  base: 'flex-row items-center',
  variants: {
    space: {
      xs: 'gap-1',
      sm: 'gap-2', 
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
      '2xl': 'gap-10'
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly'
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline'
    }
  },
  defaultVariants: {
    space: 'md',
    justify: 'start',
    align: 'center'
  }
});