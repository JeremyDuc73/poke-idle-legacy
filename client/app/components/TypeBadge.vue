<script setup lang="ts">
import { getTypeInfo } from '~/data/types'
import type { PokemonType } from '~/data/types'
import { useLocale } from '~/composables/useLocale'

const props = defineProps<{
  type: PokemonType
  size?: 'xs' | 'sm' | 'md'
}>()

const { t } = useLocale()
const info = computed(() => getTypeInfo(props.type))
const sizeClass = computed(() => {
  switch (props.size ?? 'xs') {
    case 'xs': return 'px-1.5 py-0.5 text-[9px]'
    case 'sm': return 'px-2 py-0.5 text-[10px]'
    case 'md': return 'px-2.5 py-1 text-xs'
  }
})
</script>

<template>
  <span
    class="inline-block rounded font-bold uppercase leading-none tracking-wider"
    :class="sizeClass"
    :style="{ backgroundColor: info.color + '33', color: info.color, border: `1px solid ${info.color}55` }"
  >
    {{ t(info.nameFr, info.nameEn) }}
  </span>
</template>
