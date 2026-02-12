<script setup lang="ts">
import { ref } from 'vue'
import { useGridCalculator } from '@/composables/useGridCalculator'
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
  gridData,
  totalRequiredCapital,
  resetDefaults
} = useGridCalculator()

const exportRef = ref<HTMLElement | null>(null)

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

// Export to CSV
const exportToCSV = () => {
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
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `网格交易预测_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
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
  } catch (error) {
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
          <div class="space-y-2">
            <Label for="initialPrice">初始价格 (元)</Label>
            <Input id="initialPrice" type="number" v-model.number="initialPrice" min="0" step="0.01" />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="buyGridPercent">买入网格 (%)</Label>
              <Input id="buyGridPercent" type="number" v-model.number="buyGridPercent" min="0.1" step="0.1" />
            </div>
            <div class="space-y-2">
              <Label for="sellGridPercent">卖出网格 (%)</Label>
              <Input id="sellGridPercent" type="number" v-model.number="sellGridPercent" min="0.1" step="0.1" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="buyAmount">每格买入 (元)</Label>
              <Input id="buyAmount" type="number" v-model.number="buyAmount" min="100" step="100" />
            </div>
            <div class="space-y-2">
              <Label for="sellAmount">每格卖出 (元)</Label>
              <Input id="sellAmount" type="number" v-model.number="sellAmount" min="100" step="100" />
            </div>
          </div>

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
