<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePredictionStore } from '@/composables/usePredictionStore'
import { useGridCalculator } from '@/composables/useGridCalculator'
import { amountModeOptions, spacingModeOptions } from '@/composables/useGridOptions'
import { formatCurrency, formatPercent } from '@/lib/formatters'
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
  spacingMode,
  buyGridFixed,
  spacingFactor,
  amountMode,
  baseShares,
  sharesIncrement,
  amountMultiplier,
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
      maxInvestment: maxInvestment.value,
      spacingMode: spacingMode.value,
      buyGridFixed: buyGridFixed.value,
      spacingFactor: spacingFactor.value,
      amountMode: amountMode.value,
      baseShares: baseShares.value,
      sharesIncrement: sharesIncrement.value,
      amountMultiplier: amountMultiplier.value,
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
            <!-- 间距模式切换 -->
            <div class="space-y-2">
              <Label>网格间距模式</Label>
              <div class="grid grid-cols-1 gap-2">
                <template v-for="opt in spacingModeOptions" :key="opt.value">
                  <button
                    type="button"
                    class="flex flex-col items-start px-3 py-2 rounded-md border text-left transition-colors"
                    :class="spacingMode === opt.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'"
                    @click="spacingMode = opt.value"
                  >
                    <span class="text-sm font-medium">{{ opt.label }}</span>
                    <span class="text-xs text-muted-foreground">{{ opt.desc }}</span>
                  </button>

                  <!-- 选中时展示详细说明 -->
                  <div
                    v-if="spacingMode === opt.value"
                    class="rounded-md border border-primary/20 bg-primary/5 p-3 space-y-3 text-xs"
                  >
                    <div>
                      <div class="font-semibold text-primary mb-1">计算公式</div>
                      <div class="text-muted-foreground">{{ opt.detail }}</div>
                      <div class="mt-1 font-mono bg-background/60 rounded px-2 py-1 text-[11px] text-foreground">
                        {{ opt.formula }}
                      </div>
                    </div>
                    <div>
                      <div class="font-semibold text-primary mb-1">示例</div>
                      <div class="space-y-0.5">
                        <div v-for="(ex, i) in opt.example" :key="i">
                          <template v-if="ex.value === ''">
                            <div class="text-muted-foreground italic mt-1">{{ ex.label }}</div>
                          </template>
                          <template v-else>
                            <div class="flex justify-between">
                              <span class="text-muted-foreground">{{ ex.label }}</span>
                              <span class="font-mono text-foreground">{{ ex.value }}</span>
                            </div>
                          </template>
                        </div>
                      </div>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                      <div>
                        <div class="font-semibold text-green-600 mb-1">适合场景</div>
                        <ul class="space-y-0.5">
                          <li v-for="pro in opt.pros" :key="pro" class="text-muted-foreground flex gap-1">
                            <span class="text-green-500 shrink-0">✓</span>{{ pro }}
                          </li>
                        </ul>
                      </div>
                      <div>
                        <div class="font-semibold text-orange-500 mb-1">注意事项</div>
                        <ul class="space-y-0.5">
                          <li v-for="con in opt.cons" :key="con" class="text-muted-foreground flex gap-1">
                            <span class="text-orange-400 shrink-0">!</span>{{ con }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>

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
            
            <!-- 等比例间距参数 -->
            <template v-if="spacingMode === 'percent' || spacingMode === 'variable'">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="buyGridPercent">
                    {{ spacingMode === 'variable' ? '基础网格间距 (%)' : '买入网格 (%)' }} *
                  </Label>
                  <Input 
                    id="buyGridPercent" 
                    type="number" 
                    v-model.number="buyGridPercent" 
                    min="0.1" 
                    step="0.1"
                    :class="{ 'border-red-500': buyGridPercent <= 0 }"
                  />
                </div>
                <div class="space-y-2" v-if="spacingMode === 'variable'">
                  <Label for="spacingFactor">加速系数</Label>
                  <Input 
                    id="spacingFactor" 
                    type="number" 
                    v-model.number="spacingFactor" 
                    min="1.0" 
                    max="5.0"
                    step="0.1"
                  />
                  <p class="text-xs text-muted-foreground">推荐 1.2~2.0，越大越稀疏</p>
                </div>
                <div class="space-y-2" v-else>
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
            </template>

            <!-- 等价格间距参数 -->
            <template v-if="spacingMode === 'fixed'">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="buyGridFixed">每格下跌金额 (元) *</Label>
                  <Input 
                    id="buyGridFixed" 
                    type="number" 
                    v-model.number="buyGridFixed" 
                    min="0.01" 
                    step="0.01"
                    :class="{ 'border-red-500': buyGridFixed <= 0 }"
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
            </template>

            <!-- 买入金额模式 -->
            <div class="space-y-2">
              <Label>买入金额模式</Label>
              <div class="grid grid-cols-1 gap-2">
                <template v-for="opt in amountModeOptions" :key="opt.value">
                  <button
                    type="button"
                    class="flex flex-col items-start px-3 py-2 rounded-md border text-left transition-colors"
                    :class="amountMode === opt.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'"
                    @click="amountMode = opt.value"
                  >
                    <span class="text-sm font-medium">{{ opt.label }}</span>
                    <span class="text-xs text-muted-foreground">{{ opt.desc }}</span>
                  </button>
                  <div
                    v-if="amountMode === opt.value"
                    class="rounded-md border border-primary/20 bg-primary/5 p-3 space-y-3 text-xs"
                  >
                    <div>
                      <div class="font-semibold text-primary mb-1">计算公式</div>
                      <div class="text-muted-foreground">{{ opt.detail }}</div>
                      <div class="mt-1 font-mono bg-background/60 rounded px-2 py-1 text-[11px] text-foreground">
                        {{ opt.formula }}
                      </div>
                    </div>
                    <div>
                      <div class="font-semibold text-primary mb-1">示例</div>
                      <div class="space-y-0.5">
                        <div v-for="(ex, i) in opt.example" :key="i">
                          <template v-if="ex.value === ''">
                            <div class="text-muted-foreground italic mt-1">{{ ex.label }}</div>
                          </template>
                          <template v-else>
                            <div class="flex justify-between">
                              <span class="text-muted-foreground">{{ ex.label }}</span>
                              <span class="font-mono text-foreground">{{ ex.value }}</span>
                            </div>
                          </template>
                        </div>
                      </div>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                      <div>
                        <div class="font-semibold text-green-600 mb-1">适合场景</div>
                        <ul class="space-y-0.5">
                          <li v-for="pro in opt.pros" :key="pro" class="text-muted-foreground flex gap-1">
                            <span class="text-green-500 shrink-0">✓</span>{{ pro }}
                          </li>
                        </ul>
                      </div>
                      <div>
                        <div class="font-semibold text-orange-500 mb-1">注意事项</div>
                        <ul class="space-y-0.5">
                          <li v-for="con in opt.cons" :key="con" class="text-muted-foreground flex gap-1">
                            <span class="text-orange-400 shrink-0">!</span>{{ con }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>

            <!-- 买入金额参数 -->
            <template v-if="amountMode === 'incremental'">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="baseShares">首格股数 (股) *</Label>
                  <Input id="baseShares" type="number" v-model.number="baseShares" min="100" step="100"
                    :class="{ 'border-red-500': baseShares <= 0 }" />
                  <p class="text-xs text-muted-foreground">需为 100 的整数倍</p>
                </div>
                <div class="space-y-2">
                  <Label for="sharesIncrement">每格增量 (股) *</Label>
                  <Input id="sharesIncrement" type="number" v-model.number="sharesIncrement" min="100" step="100"
                    :class="{ 'border-red-500': sharesIncrement <= 0 }" />
                  <p class="text-xs text-muted-foreground">需为 100 的整数倍</p>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="buyAmount">
                    {{ amountMode === 'multiplier' ? '基础金额 (元)' : '每格买入 (元)' }} *
                  </Label>
                  <Input id="buyAmount" type="number" v-model.number="buyAmount" min="100" step="100"
                    :class="{ 'border-red-500': buyAmount <= 0 }" />
                </div>
                <div class="space-y-2" v-if="amountMode === 'multiplier'">
                  <Label for="amountMultiplier">加仓倍数</Label>
                  <Input id="amountMultiplier" type="number" v-model.number="amountMultiplier" min="1.1" max="3.0" step="0.1" />
                  <p class="text-xs text-muted-foreground">推荐 1.2~1.5</p>
                </div>
                <div class="space-y-2" v-else>
                  <Label for="sellAmount">每格卖出 (元) *</Label>
                  <Input id="sellAmount" type="number" v-model.number="sellAmount" min="100" step="100"
                    :class="{ 'border-red-500': sellAmount <= 0 }" />
                </div>
              </div>
            </template>

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