<script setup lang="ts">
import { ref } from 'vue'
import { useGridCalculator } from '@/composables/useGridCalculator'
import { amountModeOptions, spacingModeOptions } from '@/composables/useGridOptions'
import { formatCurrency, formatPercent } from '@/lib/formatters'
import html2canvas from 'html2canvas'
import { Download, Image, RotateCcw } from 'lucide-vue-next'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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

const exportRef = ref<HTMLElement | null>(null)

// Export to CSV
const exportToCSV = () => {
  const headers = ['网格序号', '当前价格', '本格间距', '相比初始涨跌', '买入金额', '累计投入', '持仓均价', '持仓数量', '浮动盈亏', '盈亏比例', '资金警告']
  const rows = gridData.value.map(step => [
    step.index,
    step.buyPrice.toFixed(4),
    step.index === 0 ? '—' : step.gridSpacing.toFixed(4),
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
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = `网格交易预测_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  setTimeout(() => URL.revokeObjectURL(objectUrl), 100)
}

// Capture Screenshot
const captureScreenshot = async () => {
  if (!exportRef.value) return
  
  try {
    const canvas = await html2canvas(exportRef.value, {
      backgroundColor: '#ffffff',
      scale: 2 // High resolution
    })
    
    const link = document.createElement('a')
    link.download = `网格交易预测截图_${new Date().toISOString().split('T')[0]}.png`
    link.href = canvas.toDataURL()
    link.click()
  } catch (error: unknown) {
    console.error('Screenshot failed:', error)
    alert('截图生成失败，请重试')
  }
}
</script>

<template>
  <div class="container mx-auto p-4 max-w-7xl space-y-6">
    <div class="flex flex-col md:flex-row gap-6">
      <!-- Input Section -->
      <Card class="w-full md:w-1/3 h-fit">
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
                  <!-- 公式 -->
                  <div>
                    <div class="font-semibold text-primary mb-1">计算公式</div>
                    <div class="text-muted-foreground">{{ opt.detail }}</div>
                    <div class="mt-1 font-mono bg-background/60 rounded px-2 py-1 text-[11px] text-foreground">
                      {{ opt.formula }}
                    </div>
                  </div>

                  <!-- 示例 -->
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

                  <!-- 优缺点 -->
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
            <Label for="initialPrice">初始价格 (元)</Label>
            <Input id="initialPrice" type="number" v-model.number="initialPrice" min="0" step="0.01" />
          </div>

          <!-- 等比例 / 变间距 参数 -->
          <template v-if="spacingMode === 'percent' || spacingMode === 'variable'">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="buyGridPercent">
                  {{ spacingMode === 'variable' ? '基础间距 (%)' : '买入网格 (%)' }}
                </Label>
                <Input id="buyGridPercent" type="number" v-model.number="buyGridPercent" min="0.1" step="0.1" />
              </div>
              <div class="space-y-2" v-if="spacingMode === 'variable'">
                <Label for="spacingFactor">加速系数</Label>
                <Input id="spacingFactor" type="number" v-model.number="spacingFactor" min="1.0" max="5.0" step="0.1" />
                <p class="text-xs text-muted-foreground">推荐 1.2~2.0</p>
              </div>
              <div class="space-y-2" v-else>
                <Label for="sellGridPercent">卖出网格 (%)</Label>
                <Input id="sellGridPercent" type="number" v-model.number="sellGridPercent" min="0.1" step="0.1" />
              </div>
            </div>
          </template>

          <!-- 等价格间距参数 -->
          <template v-if="spacingMode === 'fixed'">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="buyGridFixed">每格下跌 (元)</Label>
                <Input id="buyGridFixed" type="number" v-model.number="buyGridFixed" min="0.01" step="0.01" />
              </div>
              <div class="space-y-2">
                <Label for="sellGridPercent">卖出网格 (%)</Label>
                <Input id="sellGridPercent" type="number" v-model.number="sellGridPercent" min="0.1" step="0.1" />
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
                <Label for="baseShares">首格股数 (股)</Label>
                <Input id="baseShares" type="number" v-model.number="baseShares" min="100" step="100" />
                <p class="text-xs text-muted-foreground">需为 100 的整数倍</p>
              </div>
              <div class="space-y-2">
                <Label for="sharesIncrement">每格增量 (股)</Label>
                <Input id="sharesIncrement" type="number" v-model.number="sharesIncrement" min="100" step="100" />
                <p class="text-xs text-muted-foreground">需为 100 的整数倍</p>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="buyAmount">
                  {{ amountMode === 'multiplier' ? '基础金额 (元)' : '每格买入 (元)' }}
                </Label>
                <Input id="buyAmount" type="number" v-model.number="buyAmount" min="100" step="100" />
              </div>
              <div class="space-y-2" v-if="amountMode === 'multiplier'">
                <Label for="amountMultiplier">加仓倍数</Label>
                <Input id="amountMultiplier" type="number" v-model.number="amountMultiplier" min="1.1" max="3.0" step="0.1" />
                <p class="text-xs text-muted-foreground">推荐 1.2~1.5</p>
              </div>
              <div class="space-y-2" v-else>
                <Label for="sellAmount">每格卖出 (元)</Label>
                <Input id="sellAmount" type="number" v-model.number="sellAmount" min="100" step="100" />
              </div>
            </div>
          </template>

          <div class="space-y-2">
            <Label for="gridCount">预测网格次数</Label>
            <Input id="gridCount" type="number" v-model.number="gridCount" min="1" max="100" step="1" />
          </div>

          <div class="space-y-2">
            <Label for="maxInvestment">最大投入警告线 (元)</Label>
            <Input id="maxInvestment" type="number" v-model.number="maxInvestment" min="0" step="1000" />
            <p class="text-xs text-muted-foreground">设为 0 则不警告</p>
          </div>

          <Button variant="outline" class="w-full mt-4" @click="resetDefaults">
            <RotateCcw class="w-4 h-4 mr-2" />
            重置参数
          </Button>
        </CardContent>
      </Card>

      <!-- Results Section -->
      <div class="w-full md:w-2/3 space-y-6" ref="exportRef">
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
              <CardTitle class="text-sm font-medium text-muted-foreground">操作</CardTitle>
            </CardHeader>
            <CardContent class="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" @click="exportToCSV">
                <Download class="w-4 h-4 mr-2" />
                导出 CSV
              </Button>
              <Button size="sm" variant="outline" @click="captureScreenshot">
                <Image class="w-4 h-4 mr-2" />
                保存图片
              </Button>
            </CardContent>
          </Card>
        </div>

        <!-- Data Table -->
        <Card>
          <CardHeader>
            <CardTitle>网格预测详情</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead class="w-[60px]">序号</TableHead>
                    <TableHead>当前价格</TableHead>
                    <TableHead>本格间距</TableHead>
                    <TableHead>相比初始</TableHead>
                    <TableHead>累计投入</TableHead>
                    <TableHead>持仓均价</TableHead>
                    <TableHead>浮动盈亏</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-if="gridData.length === 0">
                    <TableCell colspan="6" class="text-center py-8 text-muted-foreground">
                      无数据，请检查参数设置
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
                        <span class="text-xs text-muted-foreground">买入 {{ formatCurrency(step.buyAmount) }}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span class="text-muted-foreground text-sm">
                        {{ step.index === 0 ? '—' : '-' + formatCurrency(step.gridSpacing) }}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span :class="step.priceDropPercent >= 0 ? 'text-red-500' : 'text-green-500'">
                        {{ step.priceDropPercent >= 0 ? '+' : '' }}{{ step.priceDropPercent.toFixed(2) }}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <div class="flex flex-col">
                        <span>{{ formatCurrency(step.totalInvestment) }}</span>
                        <span v-if="step.isWarning" class="text-xs text-destructive font-bold">资金超限</span>
                      </div>
                    </TableCell>
                    <TableCell>{{ formatCurrency(step.averageCost) }}</TableCell>
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
    </div>
  </div>
</template>
