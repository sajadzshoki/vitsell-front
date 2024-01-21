<template>
    <div class="flex justify-center">
        <time v-if="modelValue === false" dir="ltr" class="text-center font-black text-primary-500 ">
            {{ timer.minutes }}
            :
            {{ timer.seconds }}
        </time>
        <p v-else class="text-center font-black text-primary-500 cursor-pointer"
           :class="loading ? 'cursor-not-allowed opacity-50' : ''" @click="sendAgain">
            {{ $t('ارسال دوباره') }}</p>{{}}
    </div>
</template>

<script setup>
import {useTimer} from 'vue-timer-hook';
import moment from "jalali-moment";

const props = defineProps({
    modelValue,
    second: {
        type: Number,
        default: 0
    },
    time: {
        type: String
    },
    date: {
        type: Date
    }
})
const emit = defineEmits([modelEmit, 'complete', 'sendAgain'])
const value = useModel(props, emit)
const loading = ref(false)
const date = props.date || (props.time && moment(props.time).toDate()) || moment().add(props.second, 'seconds').toDate()
let timer = useTimer(date);

watch(timer.isExpired, () => {
    value.value = timer.isExpired.value
})
const sendAgain = async () => {
    loading.value = true
    emit('sendAgain')
    value.value = false
    loading.value = false
}
</script>