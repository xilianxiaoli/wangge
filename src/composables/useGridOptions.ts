import type { GridSpacingMode, AmountMode } from './useGridCalculator'

export interface AmountModeOption {
  value: AmountMode
  label: string
  desc: string
  detail: string
  formula: string
  example: { label: string; value: string }[]
  pros: string[]
  cons: string[]
}

export interface SpacingModeOption {
  value: GridSpacingMode
  label: string
  desc: string
  detail: string
  formula: string
  example: { label: string; value: string }[]
  pros: string[]
  cons: string[]
}

export const amountModeOptions: AmountModeOption[] = [
  {
    value: 'fixed',
    label: '固定等额',
    desc: '每格买入相同金额，风险均摊',
    detail: '每格投入相同金额，简单直接，资金消耗线性可预测',
    formula: '第 i 格买入金额 = 基础金额',
    example: [
      { label: '基础金额 ¥10000，买入价 ¥1.0', value: '' },
      { label: '第 0 格（¥1.0）', value: '¥10,000 / 10000股' },
      { label: '第 1 格（¥0.9）', value: '¥10,000 / 11111股' },
      { label: '第 2 格（¥0.8）', value: '¥10,000 / 12500股' },
      { label: '共 10 格总投入', value: '¥110,000' },
    ],
    pros: ['资金消耗线性，总投入精确可控', '每格风险相同，心理压力均衡', '适合新手和保守型投资者'],
    cons: ['深跌时买入力度不足，均价下降缓慢', '回本所需涨幅相对较高'],
  },
  {
    value: 'incremental',
    label: '温和递进（固定增股）',
    desc: '每格固定多买 N 股，越跌股数越多但金额增幅自然收窄',
    detail: '每格入股数 = 首格股数 + 每格增量 × 格序号，买入金额 = 入股数 × 买入价',
    formula: '第 i 格入股数 = 首格股数 + 增量 × i\n第 i 格买入金额 = 入股数 × 买入价',
    example: [
      { label: '首格 1000 股，每格增加 200 股', value: '' },
      { label: '第 0 格（¥1.0）', value: '1000股 × ¥1.0 = ¥1,000' },
      { label: '第 1 格（¥0.9）', value: '1200股 × ¥0.9 = ¥1,080' },
      { label: '第 2 格（¥0.8）', value: '1400股 × ¥0.8 = ¥1,120' },
      { label: '第 3 格（¥0.7）', value: '1600股 × ¥0.7 = ¥1,120' },
    ],
    pros: ['越跌买股数越多，均价下降有力', '金额增幅随价格下跌自然收窄，底部不过激', '与实战高手操盘逻辑一致'],
    cons: ['需要预先评估每格股数是否符合最小交易单位（100股/手）', '总投入受价格影响，需结合最大投入预警设置'],
  },
  {
    value: 'multiplier',
    label: '马丁格尔（指数倍数）',
    desc: '每格金额按倍数递增，均价下降最快但资金消耗呈指数级',
    detail: '每格买入金额 = 基础金额 × 倍数^格序号',
    formula: '第 i 格买入金额 = 基础金额 × 倍数ⁱ',
    example: [
      { label: '基础金额 ¥1000，倍数 1.5', value: '' },
      { label: '第 0 格', value: '¥1,000' },
      { label: '第 1 格', value: '¥1,500' },
      { label: '第 2 格', value: '¥2,250' },
      { label: '第 3 格', value: '¥3,375' },
      { label: '共 10 格总投入', value: '≈ ¥113,330' },
    ],
    pros: ['均价下降速度最快，小涨即可回本', '适合短期高确定性反弹行情'],
    cons: ['资金消耗指数级增长，务必提前看好总投入', '倍数 > 1.5 时极易资金断裂，风险极高'],
  },
]

export const spacingModeOptions: SpacingModeOption[] = [
  {
    value: 'percent',
    label: '等比例间距',
    desc: '每格下跌固定百分比，越跌绝对间距越小',
    detail: '每格买入价 = 上一格价格 × (1 − 间距%)',
    formula: '第 i 格价格 = 初始价 × (1 − 间距%)ⁱ',
    example: [
      { label: '初始价 ¥10，间距 5%', value: '' },
      { label: '第 0 格', value: '¥10.00（间距 —）' },
      { label: '第 1 格', value: '¥9.50（间距 ¥0.50）' },
      { label: '第 2 格', value: '¥9.025（间距 ¥0.475）' },
      { label: '第 3 格', value: '¥8.574（间距 ¥0.451）' },
    ],
    pros: ['间距随价格同比缩小，保证每格涨回上一格的比例相同', '网格数量不受限制，价格永远不会到 0', '适合百分比思维的投资者'],
    cons: ['绝对间距越来越小，深跌时买入力度弱', '回本所需涨幅固定（始终等于间距%），理解起来稍抽象'],
  },
  {
    value: 'fixed',
    label: '等价格间距',
    desc: '每格下跌固定金额，间距均匀直觉',
    detail: '每格买入价 = 上一格价格 − 固定金额',
    formula: '第 i 格价格 = 初始价 − 每格下跌金额 × i',
    example: [
      { label: '初始价 ¥10，每格下跌 ¥0.50', value: '' },
      { label: '第 0 格', value: '¥10.00（间距 —）' },
      { label: '第 1 格', value: '¥9.50（间距 ¥0.50）' },
      { label: '第 2 格', value: '¥9.00（间距 ¥0.50）' },
      { label: '第 3 格', value: '¥8.50（间距 ¥0.50）' },
    ],
    pros: ['最直觉，挂单价格一眼看懂', '适合 A 股散户手动操作参考', '每格回本所需涨幅随价格下跌而增大，天然风险提示'],
    cons: ['价格下跌到 0 时触底，网格数量受初始价限制', '深跌时百分比间距变大，回本越来越难'],
  },
  {
    value: 'variable',
    label: '变间距网格',
    desc: '靠近初始价密集，越远间距越大',
    detail: '第 k 格的间距 = 基础间距 × 加速系数^(k−1)，间距指数增长',
    formula: '第 i 格价格 = 初始价 − Σ(k=1..i) [基础间距 × 系数^(k−1)]',
    example: [
      { label: '初始价 ¥10，基础间距 2%（¥0.20），加速系数 1.5', value: '' },
      { label: '第 0 格', value: '¥10.00（间距 —）' },
      { label: '第 1 格', value: '¥9.80（间距 ¥0.20）' },
      { label: '第 2 格', value: '¥9.50（间距 ¥0.30）' },
      { label: '第 3 格', value: '¥9.05（间距 ¥0.45）' },
      { label: '第 4 格', value: '¥8.375（间距 ¥0.675）' },
    ],
    pros: ['小跌时少量试探，大跌时重仓抄底，资金效率高', '加速系数可调，灵活控制激进程度', '适合高度看好但不确定底部的品种'],
    cons: ['加速系数过大时格数极少，需要仔细调参', '计算逻辑较复杂，不适合手动盯盘'],
  },
]
