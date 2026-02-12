import { computed } from 'vue'
import { useStorage } from '@vueuse/core'
import type { GridStep } from './useGridCalculator'

export interface GridParameters {
  stockCode?: string
  initialPrice: number
  buyGridPercent: number
  sellGridPercent: number
  buyAmount: number
  sellAmount: number
  gridCount: number
  maxInvestment: number
}

export interface GridPrediction {
  id: string
  name: string
  description?: string
  parameters: GridParameters
  results?: {
    totalRequiredCapital: number
    gridData: GridStep[]
  }
  createdAt: string
  updatedAt: string
}

const predictions = useStorage<GridPrediction[]>('wangge-predictions', [])

export function usePredictionStore() {
  // 创建新预测
  const createPrediction = (name: string, parameters: GridParameters, description?: string): GridPrediction => {
    const newPrediction: GridPrediction = {
      id: crypto.randomUUID(),
      name,
      description,
      parameters,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    predictions.value.unshift(newPrediction)
    return newPrediction
  }

  // 获取预测
  const getPrediction = (id: string): GridPrediction | undefined => {
    return predictions.value.find(p => p.id === id)
  }

  // 更新预测
  const updatePrediction = (id: string, updates: Partial<Omit<GridPrediction, 'id' | 'createdAt'>>): boolean => {
    const index = predictions.value.findIndex(p => p.id === id)
    if (index === -1) return false
    
    const existing = predictions.value[index]
    if (!existing) return false
    
    predictions.value[index] = {
      id: existing.id,
      name: updates.name ?? existing.name,
      description: updates.description ?? existing.description,
      parameters: updates.parameters ?? existing.parameters,
      results: updates.results ?? existing.results,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString()
    }
    return true
  }

  // 删除预测
  const deletePrediction = (id: string): boolean => {
    const index = predictions.value.findIndex(p => p.id === id)
    if (index !== -1) {
      predictions.value.splice(index, 1)
      return true
    }
    return false
  }

  // 复制预测
  const duplicatePrediction = (id: string): GridPrediction | null => {
    const original = getPrediction(id)
    if (!original) return null

    const duplicate: GridPrediction = {
      ...original,
      id: crypto.randomUUID(),
      name: `${original.name} (副本)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    predictions.value.unshift(duplicate)
    return duplicate
  }

  // 统计信息
  const stats = computed(() => {
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const recent = predictions.value.filter(p => 
      new Date(p.createdAt) > oneWeekAgo
    ).length

    return {
      total: predictions.value.length,
      recent
    }
  })

  return {
    predictions,
    stats,
    createPrediction,
    getPrediction,
    updatePrediction,
    deletePrediction,
    duplicatePrediction
  }
}
