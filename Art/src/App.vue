<script setup>
import NavBar from './components/NavBar.vue';
</script>

<template id="artlens-app">
  <div>
    <NavBar/>

    <main class="main-content">
      <RouterView/>
    </main>

    <footer class="app-footer">
      <p>ArtLens - Projet Framework Web L3 - Issam & Enzo - 2026</p>
    </footer>
  </div>
</template>

<style scoped>
#artlens-app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.app-footer {
  text-align: center;
  padding: 1.5rem;
  color: #888;
  font-size: 0.85rem;
  border-top: 1px solid var(--color-border);
}
</style>
