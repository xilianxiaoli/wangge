import { computed } from 'vue'
import { useStorage } from '@vueuse/core'

// 间距模式：等比例(percent) | 等价格(fixed) | 变间距(variable)
export type GridSpacingMode = 'percent' | 'fixed' | 'variable'

export interface GridStep {
  index: number
  buyPrice: number
  buyAmount: number
  sellPrice: number
  sellAmount: number
  totalInvestment: number
  totalShares: number
  averageCost: number
  floatingPL: number
  floatingPLPercent: number
  priceDropPercent: number
  gridSpacing: number   // 本格实际间距（元）
  isWarning: boolean
}

export function useGridCalculator() {
  // Persistent state using useStorage
  const initialPrice = useStorage('wangge-initialPrice', 10.0)
  const buyGridPercent = useStorage('wangge-buyGridPercent', 1.0)
  const sellGridPercent = useStorage('wangge-sellGridPercent', 1.0)
  const buyAmount = useStorage('wangge-buyAmount', 1000)
  const sellAmount = useStorage('wangge-sellAmount', 1000)
  const gridCount = useStorage('wangge-gridCount', 10)
  const maxInvestment = useStorage('wangge-maxInvestment', 10000)

  // 新增：间距模式与模式专属参数
  const spacingMode = useStorage<GridSpacingMode>('wangge-spacingMode', 'percent')
  // 等价格间距：每格固定下跌金额（元）
  const buyGridFixed = useStorage('wangge-buyGridFixed', 0.1)
  // 变间距：加速系数（>1 越大越稀疏，推荐 1.2~2.0）
  const spacingFactor = useStorage('wangge-spacingFactor', 1.5)

  /**
   * 根据当前模式计算第 i 格的买入价格
   * i=0 时始终为 initialPrice
   */
  const calcBuyPrice = (i: number): number => {
    const p0 = initialPrice.value
    if (i === 0) return p0

    if (spacingMode.value === 'percent') {
      // 等比例：每格乘以 (1 - pct/100)^i
      return p0 * Math.pow(1 - buyGridPercent.value / 100, i)
    }

    if (spacingMode.value === 'fixed') {
      // 等价格：每格减去固定金额
      return p0 - buyGridFixed.value * i
    }

    // variable：变间距，第 i 格间距 = baseSpacing * spacingFactor^(i-1)
    // baseSpacing 用 buyGridPercent（%）对应的初始绝对间距
    const baseSpacing = p0 * (buyGridPercent.value / 100)
    let price = p0
    for (let k = 1; k <= i; k++) {
      price -= baseSpacing * Math.pow(spacingFactor.value, k - 1)
    }
    return price
  }

  const gridData = computed<GridStep[]>(() => {
    const steps: GridStep[] = []

    let currentInvestment = 0
    let currentShares = 0

    // 基本校验
    if (initialPrice.value <= 0 || gridCount.value <= 0) return []
    if (spacingMode.value === 'percent' && buyGridPercent.value <= 0) return []
    if (spacingMode.value === 'fixed' && buyGridFixed.value <= 0) return []
    if (spacingMode.value === 'variable' && (buyGridPercent.value <= 0 || spacingFactor.value <= 0)) return []

    for (let i = 0; i <= gridCount.value; i++) {
      const price = calcBuyPrice(i)

      // 变间距/等价格可能导致价格 ≤ 0，终止
      if (price <= 0) break

      const prevPrice = i === 0 ? initialPrice.value : calcBuyPrice(i - 1)
      const gridSpacing = prevPrice - price

      const invest = buyAmount.value
      const sharesBought = invest / price

      currentInvestment += invest
      currentShares += sharesBought

      const averageCost = currentInvestment / currentShares

      // 卖出价跟随当前模式的上一格价格（即回到上一网格触发卖出）
      const sellPrice = prevPrice

      const marketValue = currentShares * price
      const floatingPL = marketValue - currentInvestment
      const floatingPLPercent = (floatingPL / currentInvestment) * 100

      const priceDropPercent = ((price - initialPrice.value) / initialPrice.value) * 100

      const isWarning = maxInvestment.value > 0 && currentInvestment > maxInvestment.value

      steps.push({
        index: i,
        buyPrice: price,
        buyAmount: invest,
        sellPrice,
        sellAmount: sellAmount.value,
        totalInvestment: currentInvestment,
        totalShares: currentShares,
        averageCost,
        floatingPL,
        floatingPLPercent,
        priceDropPercent,
        gridSpacing,
        isWarning
      })
    }

    return steps
  })

  const totalRequiredCapital = computed(() => {
    const data = gridData.value
    const lastStep = data[data.length - 1]
    return lastStep ? lastStep.totalInvestment : 0
  })

  const resetDefaults = () => {
    initialPrice.value = 10.0
    buyGridPercent.value = 1.0
    sellGridPercent.value = 1.0
    buyAmount.value = 1000
    sellAmount.value = 1000
    gridCount.value = 10
    maxInvestment.value = 10000
    spacingMode.value = 'percent'
    buyGridFixed.value = 0.1
    spacingFactor.value = 1.5
  }

  return {
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
    gridData,
    totalRequiredCapital,
    resetDefaults
  }
}
