<script setup lang="ts">
import { LogIn, UserPlus, Mail, Lock, User } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/useAuthStore'
import { useLocale } from '~/composables/useLocale'

definePageMeta({
  layout: false,
})

const auth = useAuthStore()
const { t } = useLocale()
const router = useRouter()

const isRegister = ref(false)
const username = ref('')
const email = ref('')
const password = ref('')
const error = ref('')

async function handleSubmit() {
  error.value = ''
  try {
    if (isRegister.value) {
      await auth.register(username.value, email.value, password.value)
    } else {
      await auth.login(email.value, password.value)
    }
    await router.push('/')
  } catch (e: any) {
    error.value = e.message || t('Une erreur est survenue', 'An error occurred')
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-900 p-4">
    <div class="w-full max-w-sm">
      <!-- Logo -->
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-yellow-400">Poke-Idle Legacy</h1>
        <p class="mt-1 text-sm text-gray-400">
          {{ isRegister ? t('Créer un compte', 'Create an account') : t('Connexion', 'Sign in') }}
        </p>
      </div>

      <!-- Form -->
      <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
        <!-- Username (register only) -->
        <div v-if="isRegister" class="relative">
          <User class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            v-model="username"
            type="text"
            :placeholder="t('Nom de dresseur', 'Trainer name')"
            required
            minlength="3"
            maxlength="50"
            class="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-indigo-500"
          />
        </div>

        <!-- Email -->
        <div class="relative">
          <Mail class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            required
            class="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-indigo-500"
          />
        </div>

        <!-- Password -->
        <div class="relative">
          <Lock class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            v-model="password"
            type="password"
            :placeholder="t('Mot de passe', 'Password')"
            required
            minlength="6"
            class="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-indigo-500"
          />
        </div>

        <!-- Error -->
        <p v-if="error" class="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {{ error }}
        </p>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="auth.isLoading"
          class="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50"
        >
          <component :is="isRegister ? UserPlus : LogIn" class="h-4 w-4" />
          {{ isRegister ? t('Créer mon compte', 'Create account') : t('Se connecter', 'Sign in') }}
        </button>
      </form>

      <!-- Toggle -->
      <p class="mt-6 text-center text-xs text-gray-500">
        {{ isRegister ? t('Déjà un compte ?', 'Already have an account?') : t('Pas encore de compte ?', 'No account yet?') }}
        <button
          class="ml-1 font-medium text-indigo-400 hover:underline"
          @click="isRegister = !isRegister; error = ''"
        >
          {{ isRegister ? t('Se connecter', 'Sign in') : t('S\'inscrire', 'Sign up') }}
        </button>
      </p>

      <!-- Skip (play without account) -->
      <div class="mt-4 text-center">
        <NuxtLink
          to="/"
          class="text-xs text-gray-600 transition-colors hover:text-gray-400"
        >
          {{ t('Jouer sans compte (données locales)', 'Play without account (local data)') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
