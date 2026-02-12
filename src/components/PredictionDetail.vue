<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePredictionStore, type GridPrediction } from '@/composables/usePredictionStore'
import { useGridCalculator } from '@/composables/useGridCalculator'
import html2canvas from 'html2canvas'
import { ArrowLeft, Download, Image, Edit, Copy, Trash2, Calculator } from 'lucide-vue-next'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

interface Props {
  predictionId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  back: []
  edit: [id: string]
  deleted: []
}>()

const { getPrediction, deletePrediction, duplicatePrediction, updatePrediction } = usePredictionStore()
const prediction = ref<GridPrediction | null>(null)
const exportRef = ref<HTMLElement | null>(null)

// 使用网格计算器重新计算结果
const {
  initialPrice,
  buyGridPercent,
  sellGridPercent,
  buyAmount,
  sellAmount,
  gridCount,
  maxInvestment,
  gridData,
  totalRequiredCapital
} = useGridCalculator()

// 加载预测数据
const loadPrediction = () => {
  const pred = getPrediction(props.predictionId)
  if (pred) {
    prediction.value = pred
    
    // 设置参数并重新计算
    initialPrice.value = pred.parameters.initialPrice
    buyGridPercent.value = pred.parameters.buyGridPercent
    sellGridPercent.value = pred.parameters.sellGridPercent
    buyAmount.value = pred.parameters.buyAmount
    sellAmount.value = pred.parameters.sellAmount
    gridCount.value = pred.parameters.gridCount
    maxInvestment.value = pred.parameters.maxInvestment

    // 更新预测结果
    updatePrediction(pred.id, {
      results: {
        totalRequiredCapital: totalRequiredCapital.value,
        gridData: gridData.value
      }
    })
  }
}

onMounted(() => {
  loadPrediction()
})

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

// Format percent
const formatPercent = (value: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100)
}

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Export to CSV
const exportToCSV = () => {
  if (!prediction.value) return
  
  const headers = ['网格序号', '当前价格', '相比初始涨跌', '买入金额', '累计投入', '持仓均价', '持仓数量', '浮动盈亏', '盈亏比例', '资金警告']
  const rows = gridData.value.map(step => [
    step.index,
    step.buyPrice.toFixed(4),
    step.priceDropPercent.toFixed(2) + '%',
    step.buyAmount.toFixed(2),
    step.totalInvestment.toFixed(2),
    step.averageCost.toFixed(4),
    step.totalShares.toFixed(0),
    step.floatingPL.toFixed(2),
    step.floatingPLPercent.toFixed(2) + '%',
    step.isWarning ? '是' : '否'
  ])

  const csvContent = [
    [`预测名称: ${prediction.value.name}`],
    [`创建时间: ${formatDate(prediction.value.createdAt)}`],
    [`更新时间: ${formatDate(prediction.value.updatedAt)}`],
    [],
    headers,
    ...rows
  ].map(row => row.join(',')).join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${prediction.value.name}_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

// Capture Screenshot
const captureScreenshot = async () => {
  if (!exportRef.value || !prediction.value) return
  
  try {
    const canvas = await html2canvas(exportRef.value, {
      backgroundColor: '#ffffff',
      scale: 2
    })
    
    const link = document.createElement('a')
    link.download = `${prediction.value.name}_截图_${new Date().toISOString().split('T')[0]}.png`
    link.href = canvas.toDataURL()
    link.click()
  } catch (error) {
    console.error('Screenshot failed:', error)
    alert('截图生成失败，请重试')
  }
}

// Handle delete
const handleDelete = () => {
  if (prediction.value && deletePrediction(prediction.value.id)) {
    emit('deleted')
  }
}

// Handle duplicate
const handleDuplicate = () => {
  if (prediction.value) {
    duplicatePrediction(prediction.value.id)
    emit('back')
  }
}

// 计算统计信息
const stats = computed(() => {
  if (!gridData.value.length) return null
  
  const lastStep = gridData.value[gridData.value.length - 1]
  if (!lastStep) return null
  
  const warningSteps = gridData.value.filter(step => step.isWarning).length
  
  return {
    totalSteps: gridData.value.length,
    warningSteps,
    maxDrop: Math.abs(lastStep.priceDropPercent),
    lowestPrice: lastStep.buyPrice,
    finalPL: lastStep.floatingPL,
    finalPLPercent: lastStep.floatingPLPercent
  }
})
</script>

<template>
  <div class="container mx-auto p-4 max-w-7xl space-y-6">
    <div v-if="!prediction" class="text-center py-12">
      <p class="text-muted-foreground">预测不存在或已被删除</p>
      <Button @click="emit('back')" class="mt-4">
        <ArrowLeft class="w-4 h-4 mr-2" />
        返回列表
      </Button>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div class="flex items-center gap-4">
          <Button variant="outline" size="sm" @click="emit('back')">
            <ArrowLeft class="w-4 h-4 mr-2" />
            返回列表
          </Button>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-3xl font-bold tracking-tight">{{ prediction.name }}</h1>
              <Badge variant="secondary">{{ prediction.parameters.gridCount }} 格</Badge>
            </div>
            <div class="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span>创建于 {{ formatDate(prediction.createdAt) }}</span>
              <span>更新于 {{ formatDate(prediction.updatedAt) }}</span>
            </div>
          </div>
        </div>
        
        <div class="flex gap-2">
          <Button variant="outline" size="sm" @click="handleDuplicate">
            <Copy class="w-4 h-4 mr-2" />
            复制
          </Button>
          <Button variant="outline" size="sm" @click="emit('edit', prediction.id)">
            <Edit class="w-4 h-4 mr-2" />
            编辑
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 class="w-4 h-4 mr-2" />
                删除
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
                <AlertDialogAction @click="handleDelete">删除</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <!-- Parameters Summary -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Calculator class="w-5 h-5" />
            参数设置
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div class="text-center">
              <div class="text-sm text-muted-foreground">初始价格</div>
              <div class="text-lg font-semibold">{{ formatCurrency(prediction.parameters.initialPrice) }}</div>
            </div>
            <div class="text-center">
              <div class="text-sm text-muted-foreground">买入网格</div>
              <div class="text-lg font-semibold">{{ prediction.parameters.buyGridPercent }}%</div>
            </div>
            <div class="text-center">
              <div class="text-sm text-muted-foreground">卖出网格</div>
              <div class="text-lg font-semibold">{{ prediction.parameters.sellGridPercent }}%</div>
            </div>
            <div class="text-center">
              <div class="text-sm text-muted-foreground">每格买入</div>
              <div class="text-lg font-semibold">{{ formatCurrency(prediction.parameters.buyAmount) }}</div>
            </div>
            <div class="text-center">
              <div class="text-sm text-muted-foreground">每格卖出</div>
              <div class="text-lg font-semibold">{{ formatCurrency(prediction.parameters.sellAmount) }}</div>
            </div>
            <div class="text-center">
              <div class="text-sm text-muted-foreground">网格次数</div>
              <div class="text-lg font-semibold">{{ prediction.parameters.gridCount }}</div>
            </div>
            <div class="text-center">
              <div class="text-sm text-muted-foreground">资金警告</div>
              <div class="text-lg font-semibold">
                {{ prediction.parameters.maxInvestment > 0 ? formatCurrency(prediction.parameters.maxInvestment) : '无' }}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Results Section -->
      <div class="space-y-6" ref="exportRef">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">预计总投入</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">{{ formatCurrency(totalRequiredCapital) }}</div>
            </CardContent>
          </Card>
          
          <Card v-if="stats">
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">最大跌幅</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold text-green-600">{{ stats.maxDrop.toFixed(2) }}%</div>
              <p class="text-xs text-muted-foreground">最低价: {{ formatCurrency(stats.lowestPrice) }}</p>
            </CardContent>
          </Card>

          <Card v-if="stats">
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">最终盈亏</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold" :class="stats.finalPL >= 0 ? 'text-red-500' : 'text-green-500'">
                {{ stats.finalPL >= 0 ? '+' : '' }}{{ formatCurrency(stats.finalPL) }}
              </div>
              <p class="text-xs text-muted-foreground">
                比例: {{ formatPercent(stats.finalPLPercent) }}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">操作</CardTitle>
            </CardHeader>
            <CardContent class="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" @click="exportToCSV">
                <Download class="w-4 h-4 mr-1" />
                导出
              </Button>
              <Button size="sm" variant="outline" @click="captureScreenshot">
                <Image class="w-4 h-4 mr-1" />
                截图
              </Button>
            </CardContent>
          </Card>
        </div>

        <!-- Warning Summary -->
        <Card v-if="stats && stats.warningSteps > 0" class="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle class="text-destructive">资金警告</CardTitle>
            <CardDescription>
              有 {{ stats.warningSteps }} 个网格节点超出了最大投入警告线
            </CardDescription>
          </CardHeader>
        </Card>

        <!-- Data Table -->
        <Card>
          <CardHeader>
            <CardTitle>网格预测详情</CardTitle>
            <CardDescription>完整的网格交易预测数据</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead class="w-[60px]">序号</TableHead>
                    <TableHead>当前价格</TableHead>
                    <TableHead>相比初始</TableHead>
                    <TableHead>买入金额</TableHead>
                    <TableHead>累计投入</TableHead>
                    <TableHead>持仓均价</TableHead>
                    <TableHead>持仓数量</TableHead>
                    <TableHead>浮动盈亏</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-if="gridData.length === 0">
                    <TableCell colspan="8" class="text-center py-8 text-muted-foreground">
                      无数据
                    </TableCell>
                  </TableRow>
                  <TableRow 
                    v-for="step in gridData" 
                    :key="step.index"
                    :class="{'bg-destructive/10': step.isWarning}"
                  >
                    <TableCell class="font-medium">{{ step.index }}</TableCell>
                    <TableCell>
                      <div class="flex flex-col">
                        <span>{{ formatCurrency(step.buyPrice) }}</span>
                        <span class="text-xs text-muted-foreground">
                          买入 {{ formatCurrency(step.buyAmount) }}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span :class="step.priceDropPercent >= 0 ? 'text-red-500' : 'text-green-500'">
                        {{ step.priceDropPercent >= 0 ? '+' : '' }}{{ step.priceDropPercent.toFixed(2) }}%
                      </span>
                    </TableCell>
                    <TableCell>{{ formatCurrency(step.buyAmount) }}</TableCell>
                    <TableCell>
                      <div class="flex flex-col">
                        <span>{{ formatCurrency(step.totalInvestment) }}</span>
                        <span v-if="step.isWarning" class="text-xs text-destructive font-bold">
                          资金超限
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{{ formatCurrency(step.averageCost) }}</TableCell>
                    <TableCell>{{ step.totalShares.toFixed(0) }}</TableCell>
                    <TableCell>
                      <div :class="step.floatingPL >= 0 ? 'text-red-500' : 'text-green-500'">
                        {{ step.floatingPL >= 0 ? '+' : '' }}{{ formatCurrency(step.floatingPL) }}
                        <span class="text-xs ml-1">({{ formatPercent(step.floatingPLPercent) }})</span>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </template>
  </div>
</template>