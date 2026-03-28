<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/Users'

const router     = useRouter()
const userStore  = useUserStore()

const email    = ref('')
const password = ref('')

async function handleLogin() {
    try {
        await userStore.login(email.value.trim(), password.value)
        router.push('/profile')
    } catch {
        // userStore.authError est déjà mis à jour par le store
    }
}
</script>

<template>
    <div class="auth-view">
        <div class="auth-card">
            <h1 class="auth-title">Connexion</h1>

            <div v-if="userStore.authError" class="error-banner" role="alert">
                {{ userStore.authError }}
            </div>

            <form class="auth-form" @submit.prevent="handleLogin" novalidate>
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
                    autocomplete="current-password"
                    required
                    placeholder="••••••••"
                />

                <button
                    type="submit"
                    class="btn btn-primary"
                    :disabled="userStore.isLoading"
                >
                    {{ userStore.isLoading ? 'Connexion…' : 'Se connecter' }}
                </button>
            </form>

            <p class="auth-switch">
                Pas encore de compte ?
                <RouterLink to="/register">Créer un compte</RouterLink>
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
    background: #fdecea;
    border: 1px solid #f5c6cb;
    color: #c0392b;
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
    border-color: var(--color-accent);
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
    background: #3b5d8a;
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
