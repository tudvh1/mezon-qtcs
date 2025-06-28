export interface IMenuResponse {
  reply: Reply
  result: string
}

interface Reply {
  menu_infos: Menuinfo[]
}

interface Menuinfo {
  dish_type_id: number
  display_order?: number
  dish_type_name: string
  dishes: Dish[]
  is_group_discount?: boolean
}

interface Dish {
  is_deleted: boolean
  description: string
  quantity: number
  price: Price
  is_active: boolean
  discount_price?: Price
  total_like: string
  options: any[]
  photos: Photo[]
  discount_remaining_quantity?: number
  is_available: boolean
  limit_type?: number
  is_searchable?: boolean
  time: Time
  id: number
  display_order: number
  mms_image: string
  properties: any[]
  is_group_discount_item: boolean
  name: string
}

interface Time {
  available: any[]
  week_days: Weekday[]
  not_available: any[]
}

interface Weekday {
  start: string
  week_day: number
  end: string
}

interface Photo {
  width: number
  value: string
  height: number
}

interface Price {
  text: string
  value: number
  unit: string
}
