export default defineAppConfig({
  toaster: {
    position: 'top-center',
    duration: 3500,
    expand: true,
    progress: true,
  },
  ui: {
    colors: {
      primary: 'brand',
      secondary: 'cyan',
      success: 'green',
      info: 'sky',
      warning: 'amber',
      error: 'rose',
      neutral: 'gray',
    },
    button: {
      base: 'cursor-pointer justify-center rounded-lg !ring-0',
      slots: {
        label: 'font-600',
      },
      compoundVariants: [
        {
          color: 'primary',
          variant: 'solid',
          class: 'text-inverted bg-primary hover:bg-primary/75 active:bg-primary/75 disabled:bg-primary aria-disabled:bg-primary outline-primary/25 focus-visible:outline-3',
        },
        {
          color: 'secondary',
          variant: 'solid',
          class: 'text-inverted bg-secondary hover:bg-secondary/75 active:bg-secondary/75 disabled:bg-secondary aria-disabled:bg-secondary outline-secondary/25 focus-visible:outline-3',
        },
        {
          color: 'success',
          variant: 'solid',
          class: 'text-inverted bg-success hover:bg-success/75 active:bg-success/75 disabled:bg-success aria-disabled:bg-success outline-success/25 focus-visible:outline-3',
        },
        {
          color: 'info',
          variant: 'solid',
          class: 'text-inverted bg-info hover:bg-info/75 active:bg-info/75 disabled:bg-info aria-disabled:bg-info outline-info/25 focus-visible:outline-3',
        },
        {
          color: 'warning',
          variant: 'solid',
          class: 'text-inverted bg-warning hover:bg-warning/75 active:bg-warning/75 disabled:bg-warning aria-disabled:bg-warning outline-warning/25 focus-visible:outline-3',
        },
        {
          color: 'error',
          variant: 'solid',
          class: 'text-inverted bg-error hover:bg-error/75 active:bg-error/75 disabled:bg-error aria-disabled:bg-error outline-error/25 focus-visible:outline-3',
        },
        {
          color: 'neutral',
          variant: 'solid',
          class: 'text-inverted bg-inverted hover:bg-inverted/90 active:bg-inverted/90 disabled:bg-inverted aria-disabled:bg-inverted outline-inverted/25 focus-visible:outline-3',
        },
        // Nuxt UI outline/subtle use ring-as-border; use real border instead
        {
          color: 'primary',
          variant: 'outline',
          class: 'border border-primary text-primary bg-default hover:bg-primary/10',
        },
        {
          color: 'primary',
          variant: 'subtle',
          class: 'border border-transparent text-primary bg-primary/10 hover:bg-primary/15',
        },
        {
          color: 'neutral',
          variant: 'outline',
          class: 'border border-accented text-default bg-default hover:bg-elevated',
        },
        {
          color: 'neutral',
          variant: 'subtle',
          class: 'border border-transparent text-default bg-elevated hover:bg-accented/75',
        },
      ],
    },
    tabs: {
      slots: {
        list: 'overflow-x-auto scrollbar-none',
        trigger: 'min-w-fit text-nowrap px-4 <md:px-2 <sm:px-1 cursor-pointer',
        label: 'text-base <md:text-sm <sm:text-xs',
      },
    },
    carousel: {
      slots: {
        // No arrows on phone (swipe only); md+ when TheCarousel enables them
        prev: 'hidden md:flex opacity-50 hover:opacity-100 transition-opacity disabled:!hidden',
        next: 'hidden md:flex opacity-50 hover:opacity-100 transition-opacity disabled:!hidden',
        dots: 'bottom-4',
        dot: 'w-2 h-2 rounded-full bg-accented transition-all data-[state=active]:bg-inverted data-[state=active]:w-8',
      },
    },
    formField: {
      variants: {
        orientation: {
          vertical: {
            container: 'mt-1.5',
          },
        },
      },
    },
    // Checkbox/slider also draw their outline with ring; ring is killed in main.css
    checkbox: {
      slots: {
        base: 'border border-accented !ring-0 bg-default data-[state=checked]:border-primary data-[state=indeterminate]:border-primary',
      },
      compoundVariants: [
        { color: 'primary', highlight: true, class: { base: 'border-primary' } },
        { color: 'secondary', highlight: true, class: { base: 'border-secondary' } },
        { color: 'success', highlight: true, class: { base: 'border-success' } },
        { color: 'info', highlight: true, class: { base: 'border-info' } },
        { color: 'warning', highlight: true, class: { base: 'border-warning' } },
        { color: 'error', highlight: true, class: { base: 'border-error' } },
        { color: 'neutral', highlight: true, class: { base: 'border-inverted' } },
      ],
    },
    slider: {
      slots: {
        thumb: 'border-2 border-primary shadow-sm',
      },
      variants: {
        color: {
          primary: { thumb: 'border-primary' },
          secondary: { thumb: 'border-secondary' },
          success: { thumb: 'border-success' },
          info: { thumb: 'border-info' },
          warning: { thumb: 'border-warning' },
          error: { thumb: 'border-error' },
          neutral: { thumb: 'border-inverted' },
        },
      },
    },
    // Replace ring-as-border with real border (see main.css ring kill)
    input: {
      slots:{
        base:"!ring-0"
      },
      variants: {
        variant: {
          outline: 'bg-default text-highlighted border border-default focus-visible:border-primary',
          subtle: 'bg-elevated text-highlighted border border-default focus-visible:border-primary',
        },
      },
      compoundVariants: [
        { highlight: true, color: 'primary', class: 'border-primary' },
        { highlight: true, color: 'secondary', class: 'border-secondary' },
        { highlight: true, color: 'success', class: 'border-success' },
        { highlight: true, color: 'info', class: 'border-info' },
        { highlight: true, color: 'warning', class: 'border-warning' },
        { highlight: true, color: 'error', class: 'border-error' },
        { highlight: true, color: 'neutral', class: 'border-inverted' },
      ],
    },
    textarea: {
      slots:{
        base:'!ring-0'
      },
      variants: {
        variant: {
          outline: 'bg-default text-highlighted border border-default focus-visible:border-primary',
          subtle: 'bg-elevated text-highlighted border border-default focus-visible:border-primary',
        },
      },
      compoundVariants: [
        { highlight: true, color: 'primary', class: 'border-primary' },
        { highlight: true, color: 'error', class: 'border-error' },
        { highlight: true, color: 'neutral', class: 'border-inverted' },
      ],
    },

    select: {
      slots: {
        base: '!ring-0 h-12 rounded-xl',
      },
      variants: {
        variant: {
          outline: 'bg-default text-highlighted border border-default focus-visible:border-primary',
          subtle: 'bg-elevated text-highlighted border border-default focus-visible:border-primary',
        },
      },
      compoundVariants: [
        { highlight: true, color: 'primary', class: 'border-primary' },
        { highlight: true, color: 'error', class: 'border-error' },
        { highlight: true, color: 'neutral', class: 'border-inverted' },
      ],
    },
    selectMenu: {
      slots: {
        base: '!ring-0 h-12 rounded-xl',
      },
      variants: {
        variant: {
          outline: 'bg-default text-highlighted border border-default focus-visible:border-primary',
          subtle: 'bg-elevated text-highlighted border border-default focus-visible:border-primary',
        },
      },
    },
    inputMenu: {
      variants: {
        variant: {
          outline: 'bg-default text-highlighted border border-default focus-visible:border-primary',
          subtle: 'bg-elevated text-highlighted border border-default focus-visible:border-primary',
        },
      },
    },
    pinInput: {
      variants: {
        variant: {
          outline: 'bg-default text-highlighted border border-default focus-visible:border-primary',
          subtle: 'bg-elevated text-highlighted border border-default focus-visible:border-primary',
        },
        size: {
          xl: {
            base: 'size-11',
          },
        },
      },
      compoundVariants: [
        { highlight: true, color: 'primary', class: 'border-primary' },
        { highlight: true, color: 'error', class: 'border-error' },
      ],
    },
    toast: {
      slots: {
        root: 'relative group overflow-hidden bg-default shadow-lg rounded-2xl border border-default p-4 flex gap-2.5 items-start',
        wrapper: 'w-0 flex-1 flex flex-col gap-0.5',
        title: 'text-sm font-semibold text-highlighted',
        description: 'text-xs text-muted leading-5 line-clamp-2',
        icon: 'shrink-0 size-5 mt-0.5',
        avatar: 'shrink-0',
        avatarSize: '2xl',
        actions: 'flex gap-1.5 shrink-0',
        progress: 'absolute inset-x-0 bottom-0',
        close: 'p-0',
      },
      defaultVariants: {
        color: 'primary',
      },
    },
    badge: {
      slots: {
        base: '!ring-0',
      },
    },
  },
})
