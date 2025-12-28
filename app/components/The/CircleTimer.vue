<template>
  <div class="flex items-center justify-center">
    <div class="relative w-64 h-64">
      <!-- Background circle -->
      <svg class="w-full h-full" viewBox="0 0 100 100">
        <!-- Full circle (background) -->
        <circle
            cx="50"
            cy="50"
            :r="radius"
            fill="transparent"
            class="stroke-gray-200 dark:stroke-gray-700"
            stroke-width="8"
        />
        <!-- Progress circle -->
        <circle
            cx="50"
            cy="50"
            :r="radius"
            fill="transparent"
            :class="progressCircleClass"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="strokeDashOffset"
            stroke-width="8"
            stroke-linecap="round"
            transform="rotate(-90 50 50)"
        />
      </svg>

      <!-- Timer display -->
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <div class="text-4xl font-bold">
          {{ formattedTime }}
        </div>
        <button
            @click="toggleTimer"
            class="mt-2 px-4 py-1 rounded-md text-sm"
            :class="isRunning ? 'bg-red-500 text-white' : 'bg-green-500 text-white'"
        >
          {{ isRunning ? 'Pause' : 'Start' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    initialTime: {
      type: Number,
      default: 60 // in seconds
    }
  },
  data() {
    return {
      timeLeft: this.initialTime,
      isRunning: false,
      timerInterval: null,
      radius: 40,
      colors: [
        'stroke-green-500',
        'stroke-blue-500',
        'stroke-yellow-500',
        'stroke-orange-500',
        'stroke-red-500'
      ]
    }
  },
  computed: {
    circumference() {
      return 2 * Math.PI * this.radius;
    },
    strokeDashOffset() {
      const progress = this.timeLeft / this.initialTime;
      return this.circumference * (1 - progress);
    },
    formattedTime() {
      const minutes = Math.floor(this.timeLeft / 60);
      const seconds = this.timeLeft % 60;
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    },
    progressCircleClass() {
      const progressPercentage = (1 - (this.timeLeft / this.initialTime)) * 100;

      if (progressPercentage < 25) return this.colors[0];
      if (progressPercentage < 50) return this.colors[1];
      if (progressPercentage < 75) return this.colors[2];
      if (progressPercentage < 90) return this.colors[3];
      return this.colors[4];
    }
  },
  methods: {
    startTimer() {
      if (this.timerInterval) return;

      this.isRunning = true;
      this.timerInterval = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
        } else {
          this.resetTimer();
          // Emit event when timer completes
          this.$emit('timerComplete');
        }
      }, 1000);
    },
    pauseTimer() {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      this.isRunning = false;
    },
    toggleTimer() {
      if (this.isRunning) {
        this.pauseTimer();
      } else {
        this.startTimer();
      }
    },
    resetTimer() {
      this.pauseTimer();
      this.timeLeft = this.initialTime;
    }
  },
  beforeUnmount() {
    this.pauseTimer();
  }
}
</script>