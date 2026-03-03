import { computed } from 'vue'
import { useStorage } from '@vueuse/core'

// 间距模式：等比例(percent) | 等价格(fixed) | 变间距(variable)
export type GridSpacingMode = 'percent' | 'fixed' | 'variable'

// 买入金额模式：固定等额(fixed) | 温和递进-固定增股(incremental) | 马丁格尔-指数倍数(multiplier)
export type AmountMode = 'fixed' | 'incremental' | 'multiplier'

export interface GridStep {
  index: number
  buyPrice: number
  buyAmount: number
  buyShares: number     // 本格入股数
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

  // 买入金额模式
  const amountMode = useStorage<AmountMode>('wangge-amountMode', 'fixed')
  // incremental：首格股数（股）
  const baseShares = useStorage('wangge-baseShares', 1000)
  // incremental：每格固定增加股数
  const sharesIncrement = useStorage('wangge-sharesIncrement', 200)
  // multiplier：指数倍数（马丁格尔，每格金额 = 上格 × 倍数）
  const amountMultiplier = useStorage('wangge-amountMultiplier', 1.5)

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

      // 根据买入金额模式计算本格入股数和投入金额
      let sharesBought: number
      let invest: number

      if (amountMode.value === 'incremental') {
        // 温和递进：首格 baseShares 股，每格递增 sharesIncrement 股
        sharesBought = baseShares.value + sharesIncrement.value * i
        invest = sharesBought * price
      } else if (amountMode.value === 'multiplier') {
        // 马丁格尔：每格金额 = 基础金额 × 倍数^i
        invest = buyAmount.value * Math.pow(amountMultiplier.value, i)
        sharesBought = invest / price
      } else {
        // 固定等额
        invest = buyAmount.value
        sharesBought = invest / price
      }

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
        buyShares: sharesBought,
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
    amountMode.value = 'fixed'
    baseShares.value = 1000
    sharesIncrement.value = 200
    amountMultiplier.value = 1.5
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
    amountMode,
    baseShares,
    sharesIncrement,
    amountMultiplier,
    gridData,
    totalRequiredCapital,
    resetDefaults
  }
}
