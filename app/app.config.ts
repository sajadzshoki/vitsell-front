export default defineAppConfig({
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
            base: 'cursor-pointer justify-center', slots: {
                label: 'font-600'
            }
        },
        tabs: {
            slots: {
                list: 'overflow-x-auto scrollbar-none',
                trigger: 'min-w-fit text-nowrap px-4  <md:px-2 <sm:px-1 cursor-pointer',
                label: 'text-base <md:text-sm <sm:text-xs ',
            }
        },

        carousel: {
            slots: {
                dots: 'bottom-4',
                dot: 'w-2 h-2 rounded-full bg-accented transition-all data-[state=active]:bg-inverted data-[state=active]:w-8',
            }
        },
        pinInput: {
            variants: {
                size: {
                    xl: {
                        base: 'size-10 flex grow'
                    }
                }
            }
        },


    }
})
