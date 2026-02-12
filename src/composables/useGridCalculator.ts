import { computed } from 'vue'
import { useStorage } from '@vueuse/core'

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
  priceDropPercent: number
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

  const gridData = computed<GridStep[]>(() => {
    const steps: GridStep[] = []
    
    let currentInvestment = 0
    let currentShares = 0
    
    // Validate inputs
    if (initialPrice.value <= 0 || buyGridPercent.value <= 0 || gridCount.value <= 0) {
      return []
    }

    let currentPrice = initialPrice.value / (1 - buyGridPercent.value / 100) // virtual previous price

    for (let i = 0; i <= gridCount.value; i++) {
      // Calculate current buy price based on grid level
      const price = i === 0 ? initialPrice.value : currentPrice * (1 - buyGridPercent.value / 100)
      currentPrice = price
      
      // Buy action
      const invest = buyAmount.value
      const sharesBought = invest / price
      
      currentInvestment += invest
      currentShares += sharesBought
      
      const averageCost = currentInvestment / currentShares
      
      // Sell price target for this grid
      const sellPrice = price * (1 + sellGridPercent.value / 100)
      
      // Floating P/L calculation
      // Value of current holdings at current price
      const marketValue = currentShares * price
      const floatingPL = marketValue - currentInvestment
      const floatingPLPercent = (floatingPL / currentInvestment) * 100
      
      // Calculate price drop percentage from initial price
      const priceDropPercent = ((price - initialPrice.value) / initialPrice.value) * 100

      // Check max investment warning
      const isWarning = maxInvestment.value > 0 && currentInvestment > maxInvestment.value

      steps.push({
        index: i,
        buyPrice: price,
        buyAmount: invest,
        sellPrice: sellPrice,
        sellAmount: sellAmount.value,
        totalInvestment: currentInvestment,
        totalShares: currentShares,
        averageCost: averageCost,
        floatingPL: floatingPL,
        floatingPLPercent: floatingPLPercent,
        priceDropPercent,
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
  }

  return {
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
  }
}
