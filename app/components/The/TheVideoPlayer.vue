<template>
  <div class="fixed inset-0 bg-black overflow-hidden w-full h-full z-15 " ref="container">
    <!-- Video Element -->
    <video
        ref="videoRef"
        class="w-full h-full object-cover "
        :poster="poster"
        :loop="true"
        playsinline
        @timeupdate="updateProgress"
        @loadedmetadata="updateDuration"
        @play="updatePlayState"
        @pause="updatePlayState"
        @click="togglePlay"
    >
      <source :src="src" type="video/mp4"/>
      Your browser does not support the video tag.
    </video>

    <!-- Top Controls -->
    <TheNuxtIcon name="arrow-right" icon-type="svg" @click="$emit('close')"
                 class="absolute top-0 left-0 right-0 m-4 z-30    text-(white 2xl) bg-black bg-opacity-60 rounded-full p-1 w-fit"
                 :class="controlsVisible ? 'opacity-100' : 'opacity-0'"/>

    <!-- Center Play Button -->
    <div v-if="controlsVisible" @click="togglePlay" class="absolute inset-0 flex items-center justify-center "
         :class="isPlaying ? '':'!bg-black !bg-opacity-40'">
      <TheNuxtIcon :name="!isPlaying?'play':'pause'" class="!svg:(w-15 h-15) rotate-90" icon-type="svg"/>
    </div>

    <!-- Bottom Controls -->
    <div
        class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300"
        :class="controlsVisible ? 'opacity-100' : 'opacity-0'">
      <!-- Progress Bar -->
      <div class="relative h-1 mb-4 bg-gray-600 rounded-full cursor-pointer" @click="seek">
        <div
            class="absolute top-0 left-0 h-full bg-white rounded-full"
            :style="{ width: `${progress}%` }"
        ></div>
      </div>

      <!-- Control Buttons -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4 gap-4">
          <!-- Play/Pause Button -->
          <TheNuxtIcon @click="togglePlay" :name="!isPlaying?'play':'pause'" class="!svg:(w-8 h-8) rotate-90"
                       icon-type="svg"/>
          <!-- Time Display -->
          <div class="text-white text-sm">
            {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
          </div>
        </div>

        <!-- Volume Control -->
        <div class="flex items-center">
          <div class="text-(white xl) " @click="toggleMute">
            <TheNuxtIcon v-if="isMuted || volume === 0" name="volume-cross" icon-type="svg"/>
            <TheNuxtIcon v-else-if="volume > 0.5" name="volume-high" icon-type="svg"/>
            <TheNuxtIcon v-else name="volume-low" icon-type="svg"/>
          </div>
          <div class="relative w-16 h-5 flex items-center">
            <div
                class="absolute h-1 rounded-lg z-0"
                :style="{ width: `${volume * 100}%`, background: 'linear-gradient(90deg, #4ade80, #3b82f6, #ef4444)' }"
            ></div>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                :value="volume"
                @input="setVolume($event.target.value)"
                class="relative z-10 w-full h-1 bg-transparent rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, onUnmounted} from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  poster: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: 'Video Player'
  },
  autoPlay: {
    type: Boolean,
    default: true
  },
  autoHideControls: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close'])

const videoRef = ref(null)
const container = ref(null)
const isPlaying = ref(false)
const isMuted = ref(false)
const volume = ref(0.7)
const currentTime = ref(0)
const duration = ref(0)
const progress = ref(0)
const controlsVisible = ref(true)
let controlsTimeout = null

// Format time to MM:SS
const formatTime = (time) => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

// Toggle play/pause
const togglePlay = () => {
  if (!videoRef.value) return

  if (videoRef.value.paused) {
    videoRef.value.play()
  } else {
    videoRef.value.pause()
  }
  showControlsTemporarily()
}

// Update play state
const updatePlayState = () => {
  isPlaying.value = !videoRef.value.paused
}

// Toggle mute
const toggleMute = () => {
  if (!videoRef.value) return
  videoRef.value.muted = !videoRef.value.muted
  isMuted.value = videoRef.value.muted
  showControlsTemporarily()
}

// Set volume
const setVolume = (value) => {
  if (!videoRef.value) return
  volume.value = parseFloat(value)
  videoRef.value.volume = volume.value
  isMuted.value = volume.value === 0
  showControlsTemporarily()
}

// Update progress bar
const updateProgress = () => {
  if (!videoRef.value) return
  currentTime.value = videoRef.value.currentTime
  progress.value = (videoRef.value.currentTime / videoRef.value.duration) * 100
}

// Update duration when metadata is loaded
const updateDuration = () => {
  if (!videoRef.value) return
  duration.value = videoRef.value.duration
}

// Seek to position when progress bar is clicked
const seek = (event) => {
  if (!videoRef.value) return
  const rect = event.currentTarget.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  videoRef.value.currentTime = percent * videoRef.value.duration
  showControlsTemporarily()
}

// Show controls temporarily
const showControlsTemporarily = () => {
  controlsVisible.value = true
  if (controlsTimeout) clearTimeout(controlsTimeout)
  if (props.autoHideControls) {
    controlsTimeout = setTimeout(() => {
      controlsVisible.value = false
    }, 3000)
  }
}

// Handle touch events for mobile
const handleTouchStart = () => {
  showControlsTemporarily()
}

// Initialize player
onMounted(() => {
  if (props.autoPlay && videoRef.value) {
    videoRef.value.play()
  }

  // Set up touch events
  if (container.value) {
    container.value.addEventListener('touchstart', handleTouchStart)
  }

  // Auto-hide controls after delay
  if (props.autoHideControls) {
    controlsTimeout = setTimeout(() => {
      controlsVisible.value = false
    }, 3000)
  }
})

// Cleanup
onUnmounted(() => {
  if (container.value) {
    container.value.removeEventListener('touchstart', handleTouchStart)
  }
  if (controlsTimeout) clearTimeout(controlsTimeout)
})
</script>

<style scoped>
/* Custom range input slider */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  border: none;
}

input[type="range"]::-moz-range-thumb {
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  border: none;
}
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  border: 2px solid #000;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
}

input[type="range"]::-moz-range-thumb {
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  border: 2px solid #000;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
}

/* For Firefox */
input[type="range"]::-moz-range-track {
  background: transparent;
  border: none;
}

/* For Chrome/Safari */
input[type="range"]::-webkit-slider-runnable-track {
  background: transparent;
  border: none;
}
</style>