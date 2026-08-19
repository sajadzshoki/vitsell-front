export default defineAppConfig({
    ui: {
        colors: {
            primary: 'green',
            secondary: 'blue',
            success: 'green',
            info: 'blue',
            warning: 'yellow',
            error: 'red',
            neutral: 'slate',
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
                dots: '-bottom-5',
                dot: '!w-2 !h-1  rounded-full  transition',
                dotActive: 'bg-white w-4'
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
