<script setup lang="ts">
import { getSpriteUrl, getShinySpriteUrl, getStaticSpriteUrl, getStaticShinySpriteUrl, getPokeApiSpriteUrl } from '~/utils/showdown'
import { POKEDEX } from '~/data/pokedex'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  slug: string
  shiny?: boolean
}>()

const attrs = useAttrs()

const pokedexId = computed(() => POKEDEX.find(p => p.slug === props.slug)?.id ?? 0)

const phase = ref<'ani' | 'static' | 'pokeapi' | 'none'>('ani')

const src = computed(() => {
  const s = props.slug
  const isShiny = props.shiny ?? false
  switch (phase.value) {
    case 'ani':
      return isShiny ? getShinySpriteUrl(s) : getSpriteUrl(s)
    case 'static':
      return isShiny ? getStaticShinySpriteUrl(s) : getStaticSpriteUrl(s)
    case 'pokeapi':
      return pokedexId.value > 0 ? getPokeApiSpriteUrl(pokedexId.value, isShiny) : ''
    default:
      return ''
  }
})

function onError() {
  if (phase.value === 'ani') phase.value = 'static'
  else if (phase.value === 'static') phase.value = pokedexId.value > 0 ? 'pokeapi' : 'none'
  else phase.value = 'none'
}

watch(() => props.slug + (props.shiny ? '-s' : ''), () => {
  phase.value = 'ani'
})
</script>

<template>
  <img
    v-if="phase !== 'none'"
    v-bind="attrs"
    :src="src"
    :alt="(attrs.alt as string) ?? slug"
    class="object-contain"
    loading="lazy"
    @error="onError"
  />
  <div
    v-else
    v-bind="attrs"
    class="flex items-center justify-center text-xl text-slate-600"
  >?</div>
</template>
