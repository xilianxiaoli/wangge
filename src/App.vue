<script setup lang="ts">
import GridCalculator from './components/GridCalculator.vue'
</script>

<template>
  <div class="min-h-screen bg-background text-foreground font-sans antialiased">
    <header class="border-b">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xl font-bold tracking-tight">Wangge Tool</span>
          <span class="text-sm text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Beta</span>
        </div>
        <nav class="flex gap-4 text-sm font-medium text-muted-foreground">
          <a href="#" class="hover:text-foreground transition-colors">Documentation</a>
          <a href="#" class="hover:text-foreground transition-colors">GitHub</a>
        </nav>
      </div>
    </header>
    <main class="py-8">
      <GridCalculator />
    </main>
    <footer class="border-t py-6 mt-12">
      <div class="container mx-auto px-4 text-center text-sm text-muted-foreground">
        © 2026 Wangge Tool. All rights reserved.
      </div>
    </footer>
  </div>
</template>
