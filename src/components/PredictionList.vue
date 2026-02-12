<script setup lang="ts">
import { computed } from 'vue'
import { usePredictionStore } from '@/composables/usePredictionStore'
import { Plus, Eye, Copy, Trash2, TrendingDown, Calendar, DollarSign } from 'lucide-vue-next'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Badge from './ui/badge.vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog'

const emit = defineEmits<{
  createNew: []
  viewPrediction: [id: string]
}>()

const { predictions, stats, deletePrediction, duplicatePrediction } = usePredictionStore()

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Handle delete
const handleDelete = (id: string) => {
  deletePrediction(id)
}

// Handle duplicate
const handleDuplicate = (id: string) => {
  duplicatePrediction(id)
}

// Handle view
const handleView = (id: string) => {
  emit('viewPrediction', id)
}

// Sorted predictions (newest first)
const sortedPredictions = computed(() => {
  return [...predictions.value].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
})
</script>

<template>
  <div class="container mx-auto p-4 max-w-6xl space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">网格预测管理</h1>
        <p class="text-muted-foreground">管理和查看您的股票网格交易预测</p>
      </div>
      <Button @click="emit('createNew')" class="flex items-center gap-2">
        <Plus class="w-4 h-4" />
        新建预测
      </Button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingDown class="w-4 h-4" />
            总预测数
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.total }}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Calendar class="w-4 h-4" />
            本周新增
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.recent }}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <DollarSign class="w-4 h-4" />
            平均投入
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ predictions.length > 0 
              ? formatCurrency(predictions.reduce((sum, p) => sum + (p.parameters.buyAmount * p.parameters.gridCount), 0) / predictions.length)
              : '¥0' 
            }}
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Predictions List -->
    <div v-if="sortedPredictions.length === 0" class="text-center py-12">
      <div class="text-muted-foreground mb-4">
        <TrendingDown class="w-12 h-12 mx-auto mb-4 opacity-50" />
        <h3 class="text-lg font-medium">暂无预测</h3>
        <p>开始创建您的第一个网格交易预测吧</p>
      </div>
      <Button @click="emit('createNew')" class="mt-4">
        <Plus class="w-4 h-4 mr-2" />
        创建预测
      </Button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card 
        v-for="prediction in sortedPredictions" 
        :key="prediction.id"
        class="hover:shadow-md transition-shadow cursor-pointer"
        @click="handleView(prediction.id)"
      >
        <CardHeader class="pb-3">
          <div class="flex justify-between items-start">
            <div class="flex-1 min-w-0">
              <CardTitle class="text-lg truncate">{{ prediction.name }}</CardTitle>
              <CardDescription class="text-sm">
                {{ formatDate(prediction.updatedAt) }}
              </CardDescription>
            </div>
            <Badge variant="secondary" class="ml-2">
              {{ prediction.parameters.gridCount }} 格
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="space-y-3">
          <!-- Key Parameters -->
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span class="text-muted-foreground">初始价格</span>
              <div class="font-medium">{{ formatCurrency(prediction.parameters.initialPrice) }}</div>
            </div>
            <div>
              <span class="text-muted-foreground">每格买入</span>
              <div class="font-medium">{{ formatCurrency(prediction.parameters.buyAmount) }}</div>
            </div>
            <div>
              <span class="text-muted-foreground">买入网格</span>
              <div class="font-medium">{{ prediction.parameters.buyGridPercent }}%</div>
            </div>
            <div>
              <span class="text-muted-foreground">预计投入</span>
              <div class="font-medium">
                {{ formatCurrency(prediction.parameters.buyAmount * prediction.parameters.gridCount) }}
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 pt-2 border-t" @click.stop>
            <Button 
              size="sm" 
              variant="outline" 
              class="flex-1"
              @click="handleView(prediction.id)"
            >
              <Eye class="w-3 h-3 mr-1" />
              查看
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              @click="handleDuplicate(prediction.id)"
            >
              <Copy class="w-3 h-3" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Trash2 class="w-3 h-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认删除</AlertDialogTitle>
                  <AlertDialogDescription>
                    您确定要删除预测"{{ prediction.name }}"吗？此操作无法撤销。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction @click="handleDelete(prediction.id)">
                    删除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>