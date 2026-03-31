<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/Users'

const router    = useRouter()
const userStore = useUserStore()

const username = ref('')
const email    = ref('')
const password = ref('')
const passwordConfirm = ref('')
const localError = ref('')

async function handleRegister() {
    localError.value = ''

    if (password.value !== passwordConfirm.value) {
        localError.value = 'Les mots de passe ne correspondent pas'
        return
    }
    if (password.value.length < 8) {
        localError.value = 'Le mot de passe doit contenir au moins 8 caractères'
        return
    }

    try {
        await userStore.register(username.value.trim(), email.value.trim(), password.value)
        router.push('/profile')
    } catch {
        // handled by store
    }
}

function errorMessage() {
    return localError.value || userStore.authError
}
</script>

<template>
    <div class="auth-view">
        <div class="auth-card">
            <h1 class="auth-title">Créer un compte</h1>

            <div v-if="errorMessage()" class="error-banner" role="alert">
                {{ errorMessage() }}
            </div>

            <form class="auth-form" @submit.prevent="handleRegister" novalidate>
                <label for="username">Nom d'utilisateur</label>
                <input
                    id="username"
                    v-model="username"
                    type="text"
                    autocomplete="username"
                    required
                    minlength="3"
                    maxlength="50"
                    placeholder="MonPseudo"
                />

                <label for="email">Email</label>
                <input
                    id="email"
                    v-model="email"
                    type="email"
                    autocomplete="email"
                    required
                    placeholder="vous@exemple.com"
                />

                <label for="password">Mot de passe</label>
                <input
                    id="password"
                    v-model="password"
                    type="password"
                    autocomplete="new-password"
                    required
                    minlength="8"
                    placeholder="Minimum 8 caractères"
                />

                <label for="password-confirm">Confirmer le mot de passe</label>
                <input
                    id="password-confirm"
                    v-model="passwordConfirm"
                    type="password"
                    autocomplete="new-password"
                    required
                    placeholder="••••••••"
                />

                <button
                    type="submit"
                    class="btn btn-primary"
                    :disabled="userStore.isLoading"
                >
                    {{ userStore.isLoading ? 'Création…' : 'Créer mon compte' }}
                </button>
            </form>

            <p class="auth-switch">
                Déjà un compte ?
                <RouterLink to="/login">Se connecter</RouterLink>
            </p>
        </div>
    </div>
</template>

<style scoped>
.auth-view {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 3rem 1rem;
}

.auth-card {
    width: 100%;
    max-width: 420px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md, 8px);
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.auth-title {
    font-size: 1.6rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 0.25rem;
}

.error-banner {
    background: #F5E8E8;
    border: 1px solid rgba(139, 32, 32, 0.25);
    color: var(--color-error);
    padding: 0.75rem 1rem;
    border-radius: 6px;
    font-size: 0.9rem;
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.auth-form label {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-text);
}

.auth-form input {
    padding: 0.6rem 0.8rem;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    font-size: 1rem;
    background: var(--color-background, #fff);
    color: var(--color-text);
    transition: border-color 0.2s;
}

.auth-form input:focus {
    outline: none;
    border-color: var(--color-gold);
    box-shadow: 0 0 0 3px rgba(196, 154, 60, 0.18);
}

.btn-primary {
    margin-top: 0.5rem;
    padding: 0.7rem;
    background: var(--color-accent);
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, opacity 0.2s;
}

.btn-primary:disabled {
    opacity: 0.65;
    cursor: not-allowed;
}

.btn-primary:not(:disabled):hover {
    background: var(--color-accent-hover);
}

.auth-switch {
    text-align: center;
    font-size: 0.9rem;
    color: var(--color-text-secondary);
}

.auth-switch a {
    color: var(--color-accent);
    font-weight: 600;
    text-decoration: none;
}

.auth-switch a:hover {
    text-decoration: underline;
}
</style>
