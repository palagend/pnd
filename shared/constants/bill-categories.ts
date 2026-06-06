export const BILL_CATEGORIES = {
  income: [
    '工资收入',
    '奖金收入',
    '投资收益',
    '兼职收入',
    '其他收入'
  ],
  expense: [
    '餐饮支出',
    '交通支出',
    '购物支出',
    '娱乐支出',
    '医疗支出',
    '教育支出',
    '房租支出',
    '水电支出',
    '通讯支出',
    '其他支出'
  ]
} as const

export type BillCategory = typeof BILL_CATEGORIES.expense[number] | typeof BILL_CATEGORIES.income[number]
