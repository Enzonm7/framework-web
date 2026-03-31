<script setup>
import NavBar from './components/NavBar.vue';
</script>

<template id="artlens-app">
  <div class="app-wrapper">
    <NavBar/>

    <main class="main-content">
      <!-- mode="out-in" : l'ancienne page disparaît complètement avant
           que la nouvelle apparaisse. Sans ça les deux se superposent. -->
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component"/>
        </Transition>
      </RouterView>
    </main>

    <footer class="app-footer">
      <div class="footer-inner">
        <span class="footer-brand">ArtLens</span>
        <span class="footer-sep">·</span>
        <span class="footer-info">Projet Framework Web L3 &mdash; Issam &amp; Enzo &mdash; 2026</span>
        <span class="footer-sep">·</span>
        <span class="footer-sources">Met Museum · Harvard Art · Europeana</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.app-footer {
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
  padding: 1.25rem 1.5rem;
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem 0.75rem;
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

.footer-brand {
  font-family: var(--font-heading);
  font-style: italic;
  color: var(--color-gold-dark);
  font-size: 0.9rem;
}

.footer-sep {
  color: var(--color-border);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
