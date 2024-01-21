import Vue3Toastify, {toast, ToastContainerOptions} from 'vue3-toastify';

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(Vue3Toastify, {autoClose: 3000,rtl:true,position:'top-right'} as ToastContainerOptions);

    return {
        provide: {toast},
    };
});