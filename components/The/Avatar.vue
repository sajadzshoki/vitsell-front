<template>
  <div
      class="rounded-full flex items-center pb-2 justify-center font-bold text-primary-400 uppercase"
      :style="{ backgroundColor: color, minWidth: size + 'px', height: size + 'px', fontSize: size / 3 + 'px' }"
  >
    {{ letter }}
  </div>
</template>

<script setup lang="ts">


const props = defineProps({
  name: { type: String, required: true },
  lastName: { type: String, required: false },
  size: { type: Number, default: 52 }
})

 const noProfileGenerator=(firstName :string = '' , lastName :string = ''  )=>{
  const COLORS = [
    '#E0EAFB',
  ];
  const firstLetterFirstName = firstName.trim()?.[0]?.toUpperCase();
  const firstLetterLastName = lastName.trim()?.[0]?.toUpperCase();
  const letter = (firstLetterFirstName|| '') + ' '+(firstLetterLastName||'')
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  return { letter, color };
}
const { letter, color } = noProfileGenerator(props.name,props.lastName)
</script>
