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

      <!-- Google Sign In -->
      <div class="mt-4">
        <div class="relative mb-4">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-700" />
          </div>
          <div class="relative flex justify-center text-xs">
            <span class="bg-gray-900 px-2 text-gray-500">{{ t('ou', 'or') }}</span>
          </div>
        </div>
        <a
          href="http://localhost:3333/auth/google/redirect"
          class="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-700 bg-gray-800 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-700"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {{ t('Continuer avec Google', 'Continue with Google') }}
        </a>
      </div>

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

      <!-- Pokedex link -->
      <div class="mt-4 text-center">
        <NuxtLink
          to="/pokedex"
          class="text-xs text-gray-600 transition-colors hover:text-gray-400"
        >
          {{ t('Consulter le Pokédex', 'Browse the Pokédex') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
