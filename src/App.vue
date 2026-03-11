<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PredictionList from './components/PredictionList.vue'
import NewPrediction from './components/NewPrediction.vue'
import PredictionDetail from './components/PredictionDetail.vue'

type View = 'list' | 'new' | 'detail'

const currentView = ref<View>('list')
const selectedPredictionId = ref<string | null>(null)
const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  } else if (!savedTheme) {
    // Default to light mode - do nothing
    isDark.value = false
  }
})

const showList = () => {
  currentView.value = 'list'
  selectedPredictionId.value = null
}

const showNew = () => {
  currentView.value = 'new'
}

const showDetail = (id: string) => {
  selectedPredictionId.value = id
  currentView.value = 'detail'
}

const handleSaved = (id: string) => {
  showDetail(id)
}
</script>

<template>
  <div class="min-h-screen bg-background text-foreground font-sans antialiased">
    <header class="border-b">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-2 cursor-pointer" @click="showList">
          <span class="text-xl font-bold tracking-tight">网格预测工具</span>
          <span class="text-sm text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Beta</span>
        </div>
        <nav class="flex gap-4 items-center text-sm font-medium text-muted-foreground">
          <button 
            @click="toggleTheme" 
            class="p-2 rounded-md hover:bg-secondary hover:text-foreground transition-colors"
            :title="isDark ? '切换到白天模式' : '切换到夜间模式'"
          >
            <!-- Sun icon (show in dark mode) -->
            <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <!-- Moon icon (show in light mode) -->
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
          <a href="#" class="hover:text-foreground transition-colors">文档</a>
          <a href="#" class="hover:text-foreground transition-colors">GitHub</a>
        </nav>
      </div>
    </header>
    <main class="py-8">
      <PredictionList 
        v-if="currentView === 'list'"
        @create-new="showNew"
        @view-prediction="showDetail"
      />
      <NewPrediction 
        v-else-if="currentView === 'new'"
        @back="showList"
        @saved="handleSaved"
      />
      <PredictionDetail 
        v-else-if="currentView === 'detail' && selectedPredictionId"
        :prediction-id="selectedPredictionId"
        @back="showList"
        @edit="showDetail"
        @deleted="showList"
      />
    </main>
    <footer class="border-t py-6 mt-12">
      <div class="container mx-auto px-4 text-center text-sm text-muted-foreground">
        © 2026 网格预测工具. All rights reserved.
      </div>
    </footer>
  </div>
</template>
