<script setup lang="ts">
const props = defineProps<{
  damage: number
  x: number
  y: number
}>()

const visible = ref(true)

onMounted(() => {
  setTimeout(() => {
    visible.value = false
  }, 800)
})
</script>

<template>
  <Transition name="float-up">
    <span
      v-if="visible"
      class="pointer-events-none fixed z-50 select-none text-lg font-bold text-yellow-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
      :style="{ left: `${x}px`, top: `${y}px` }"
    >
      -{{ damage }}
    </span>
  </Transition>
</template>

<style scoped>
.float-up-enter-active {
  transition: all 0.8s ease-out;
}
.float-up-leave-active {
  transition: all 0.3s ease-in;
}
.float-up-enter-from {
  opacity: 1;
  transform: translateY(0) scale(1.2);
}
.float-up-leave-to,
.float-up-enter-to {
  opacity: 0;
  transform: translateY(-40px) scale(0.8);
}
</style>
