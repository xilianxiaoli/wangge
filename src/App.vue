<script setup lang="ts">
import { ref } from 'vue'
import PredictionList from './components/PredictionList.vue'
import NewPrediction from './components/NewPrediction.vue'
import PredictionDetail from './components/PredictionDetail.vue'

type View = 'list' | 'new' | 'detail'

const currentView = ref<View>('list')
const selectedPredictionId = ref<string | null>(null)

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
        <nav class="flex gap-4 text-sm font-medium text-muted-foreground">
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
