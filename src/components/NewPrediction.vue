<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePredictionStore } from '@/composables/usePredictionStore'
import { useGridCalculator } from '@/composables/useGridCalculator'
import { ArrowLeft, Save, Calculator, RotateCcw } from 'lucide-vue-next'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import Textarea from './ui/textarea.vue'

const emit = defineEmits<{
  back: []
  saved: [id: string]
}>()

const { createPrediction } = usePredictionStore()

// 预测名称和描述
const predictionName = ref('')
const predictionDescription = ref('')

// 使用网格计算器的逻辑
const {
  initialPrice,
  buyGridPercent,
  sellGridPercent,
  buyAmount,
  sellAmount,
  gridCount,
  maxInvestment,
  gridData,
  totalRequiredCapital,
  resetDefaults
} = useGridCalculator()

// 表单验证
const isFormValid = computed(() => {
  return predictionName.value.trim().length > 0 &&
         initialPrice.value > 0 &&
         buyGridPercent.value > 0 &&
         sellGridPercent.value > 0 &&
         buyAmount.value > 0 &&
         sellAmount.value > 0 &&
         gridCount.value > 0
})

// 保存预测
const savePrediction = () => {
  if (!isFormValid.value) {
    alert('请填写完整的预测信息')
    return
  }

  const newPrediction = createPrediction(
    predictionName.value.trim(),
    {
      stockCode: '',
      initialPrice: initialPrice.value,
      buyGridPercent: buyGridPercent.value,
      sellGridPercent: sellGridPercent.value,
      buyAmount: buyAmount.value,
      sellAmount: sellAmount.value,
      gridCount: gridCount.value,
      maxInvestment: maxInvestment.value
    },
    predictionDescription.value.trim() || undefined
  )

  emit('saved', newPrediction.id)
}

// 重置表单
const resetForm = () => {
  predictionName.value = ''
  predictionDescription.value = ''
  resetDefaults()
}

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
</script>

<template>
  <div class="container mx-auto p-4 max-w-7xl space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <Button variant="outline" size="sm" @click="emit('back')">
        <ArrowLeft class="w-4 h-4 mr-2" />
        返回列表
      </Button>
      <div>
        <h1 class="text-3xl font-bold tracking-tight">新建预测</h1>
        <p class="text-muted-foreground">创建一个新的网格交易预测</p>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Input Section -->
      <div class="w-full lg:w-1/3 space-y-6">
        <!-- Basic Info -->
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>设置预测的基本信息</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <Label for="predictionName">预测名称 *</Label>
              <Input 
                id="predictionName" 
                v-model="predictionName" 
                placeholder="例如：腾讯控股网格预测"
                :class="{ 'border-red-500': predictionName.trim() === '' }"
              />
            </div>
            
            <div class="space-y-2">
              <Label for="predictionDescription">备注说明</Label>
              <Textarea 
                id="predictionDescription" 
                v-model="predictionDescription" 
                placeholder="可选：添加一些备注说明..."
                :rows="3"
              />
            </div>
          </CardContent>
        </Card>

        <!-- Parameters -->
        <Card>
          <CardHeader>
            <CardTitle>参数设置</CardTitle>
            <CardDescription>设置网格交易的初始条件</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <Label for="initialPrice">初始价格 (元) *</Label>
              <Input 
                id="initialPrice" 
                type="number" 
                v-model.number="initialPrice" 
                min="0" 
                step="0.01"
                :class="{ 'border-red-500': initialPrice <= 0 }"
              />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="buyGridPercent">买入网格 (%) *</Label>
                <Input 
                  id="buyGridPercent" 
                  type="number" 
                  v-model.number="buyGridPercent" 
                  min="0.1" 
                  step="0.1"
                  :class="{ 'border-red-500': buyGridPercent <= 0 }"
                />
              </div>
              <div class="space-y-2">
                <Label for="sellGridPercent">卖出网格 (%) *</Label>
                <Input 
                  id="sellGridPercent" 
                  type="number" 
                  v-model.number="sellGridPercent" 
                  min="0.1" 
                  step="0.1"
                  :class="{ 'border-red-500': sellGridPercent <= 0 }"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="buyAmount">每格买入 (元) *</Label>
                <Input 
                  id="buyAmount" 
                  type="number" 
                  v-model.number="buyAmount" 
                  min="100" 
                  step="100"
                  :class="{ 'border-red-500': buyAmount <= 0 }"
                />
              </div>
              <div class="space-y-2">
                <Label for="sellAmount">每格卖出 (元) *</Label>
                <Input 
                  id="sellAmount" 
                  type="number" 
                  v-model.number="sellAmount" 
                  min="100" 
                  step="100"
                  :class="{ 'border-red-500': sellAmount <= 0 }"
                />
              </div>
            </div>

            <div class="space-y-2">
              <Label for="gridCount">预测网格次数 *</Label>
              <Input 
                id="gridCount" 
                type="number" 
                v-model.number="gridCount" 
                min="1" 
                max="100" 
                step="1"
                :class="{ 'border-red-500': gridCount <= 0 }"
              />
            </div>

            <div class="space-y-2">
              <Label for="maxInvestment">最大投入警告线 (元)</Label>
              <Input 
                id="maxInvestment" 
                type="number" 
                v-model.number="maxInvestment" 
                min="0" 
                step="1000"
              />
              <p class="text-xs text-muted-foreground">设为 0 则不警告</p>
            </div>

            <div class="flex gap-2 pt-4">
              <Button variant="outline" class="flex-1" @click="resetForm">
                <RotateCcw class="w-4 h-4 mr-2" />
                重置
              </Button>
              <Button 
                class="flex-1" 
                @click="savePrediction"
                :disabled="!isFormValid"
              >
                <Save class="w-4 h-4 mr-2" />
                保存预测
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Preview Section -->
      <div class="w-full lg:w-2/3 space-y-6">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">预计总投入</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">{{ formatCurrency(totalRequiredCapital) }}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">网格深度</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">{{ gridCount }} 格</div>
              <p class="text-xs text-muted-foreground">
                最低价: {{ formatCurrency(gridData[gridData.length-1]?.buyPrice || 0) }}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calculator class="w-4 h-4" />
                实时预览
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-sm text-muted-foreground">
                {{ gridData.length }} 个网格节点
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Preview Table -->
        <Card>
          <CardHeader>
            <CardTitle>预测预览</CardTitle>
            <CardDescription>实时预览网格交易计算结果</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="rounded-md border overflow-x-auto max-h-96">
              <table class="w-full text-sm">
                <thead class="border-b bg-muted/50">
                  <tr>
                    <th class="text-left p-2 font-medium">序号</th>
                    <th class="text-left p-2 font-medium">价格</th>
                    <th class="text-left p-2 font-medium">相比初始</th>
                    <th class="text-left p-2 font-medium">累计投入</th>
                    <th class="text-left p-2 font-medium">浮动盈亏</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="gridData.length === 0">
                    <td colspan="5" class="text-center py-8 text-muted-foreground">
                      请设置有效的参数以查看预测结果
                    </td>
                  </tr>
                  <tr 
                    v-for="step in gridData.slice(0, 10)" 
                    :key="step.index"
                    :class="{'bg-destructive/10': step.isWarning}"
                    class="border-b hover:bg-muted/50"
                  >
                    <td class="p-2 font-medium">{{ step.index }}</td>
                    <td class="p-2">
                      <div class="flex flex-col">
                        <span>{{ formatCurrency(step.buyPrice) }}</span>
                        <span class="text-xs text-muted-foreground">
                          买入 {{ formatCurrency(step.buyAmount) }}
                        </span>
                      </div>
                    </td>
                    <td class="p-2">
                      <span :class="step.priceDropPercent >= 0 ? 'text-red-500' : 'text-green-500'">
                        {{ step.priceDropPercent >= 0 ? '+' : '' }}{{ step.priceDropPercent.toFixed(2) }}%
                      </span>
                    </td>
                    <td class="p-2">
                      <div class="flex flex-col">
                        <span>{{ formatCurrency(step.totalInvestment) }}</span>
                        <span v-if="step.isWarning" class="text-xs text-destructive font-bold">
                          资金超限
                        </span>
                      </div>
                    </td>
                    <td class="p-2">
                      <div :class="step.floatingPL >= 0 ? 'text-red-500' : 'text-green-500'">
                        {{ step.floatingPL >= 0 ? '+' : '' }}{{ formatCurrency(step.floatingPL) }}
                        <span class="text-xs ml-1">({{ formatPercent(step.floatingPLPercent) }})</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <div v-if="gridData.length > 10" class="p-2 text-center text-sm text-muted-foreground border-t">
                还有 {{ gridData.length - 10 }} 个网格节点，保存后可查看完整数据
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>