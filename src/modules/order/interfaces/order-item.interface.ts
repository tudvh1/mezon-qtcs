export interface IOrderItemCreatePayload {
  menuDishId: string
  note?: string
}

export interface IMultipleOrderItemsSummary {
  contexts: string[]
  totalPrice: string
}
