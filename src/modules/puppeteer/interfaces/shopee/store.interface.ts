export interface IShopeeStoreResponse {
  reply: Reply
  result: string
}

interface Reply {
  delivery_detail: Deliverydetail
}

interface Deliverydetail {
  total_order: number
  rating: Rating
  is_subscribe: boolean
  is_favorite: boolean
  city_id: number
  phones: string[]
  restaurant_id: number
  is_now_delivery: boolean
  restaurant_url: string
  logo_mms_img_id: string
  brand_id: number
  video: null
  asap_is_available: boolean
  contract_type: number
  id: number
  location_url: string
  is_quality_merchant: boolean
  available_times: Availabletime[]
  banner_mms_img_id: string
  is_city_alert: boolean
  categories: string[]
  cuisines: any[]
  service_type: number
  price_slash_discounts: any[]
  delivery_fees: any[]
  vat: null
  confirm_language: null
  is_in_category_whitelist: boolean
  brand: null
  limit_distance: number
  delivery_categories: number[]
  user_favorite_count: number
  delivery: Delivery
  photos: Photo[]
  is_display_cutlery: boolean
  confirm_methods: any
  address: string
  price_range: Pricerange
  foody_service_id: number
  min_order_value: Minordervalue
  root_category_ids: number[]
  campaigns: any[]
  name: string
  url: string
  display_order: number
  delivery_id: number
  district_id: number
  is_pickup: boolean
  supporting_document_urls: any
  short_description: null
  url_rewrite_name: string
  parent_category_id: number
  position: Position
  name_en: string
  res_photos: Resphoto[]
}

interface Resphoto {
  photos: Photo[]
}

interface Position {
  latitude: number
  is_verified: boolean
  longitude: number
}

interface Pricerange {
  min_price: number
  max_price: number
}

interface Photo {
  width: number
  value: string
  height: number
}

interface Delivery {
  promotions: Promotion[]
  delivery_alert: Deliveryalert
  time: Time
  service_by: string
  service_fee: Servicefee
  merchant_limit_distance: number
  payment_methods: number[]
  has_contract: boolean
  setting_limit_distance: number
  merchant_time: number
  prepare_duration: number
  ship_types: any[]
  avg_price: Avgprice
  min_order_value: Minordervalue
  operating: Operating
  is_open: boolean
  shipping_fee: Shippingfee
  is_peak_mode: boolean
  min_charge: string
  is_foody_delivery: boolean
}

interface Shippingfee {
  text: Formattext
  value: number
  is_increasing: number
  rate: number
  minimum_fee: string
  unit: string
}

interface Operating {
  status: number
  next_available_time: string
  busy_type: number
  title: string
  color: string
  text: Text
  note: Title
  message: string
}

interface Text {
  resource_name: string
}

interface Minordervalue {
  text: string
  value: number
  unit: string
}

interface Avgprice {
  text: string
  format_text: Formattext
  value: number
  unit: string
}

interface Formattext {
  resource_name: string
  resource_args: string[]
}

interface Servicefee {
  text: string
  value: number
}

interface Time {
  available: any[]
  week_days: Weekday[]
  not_available: any[]
}

interface Weekday {
  start_time: string
  week_day: number
  end_time: string
}

interface Deliveryalert {
  message: Title
  type: number
  title: Title
}

interface Promotion {
  apply_times: Applytime[]
  gen_source: number
  promo_code: string
  is_check_airpay_new_user: boolean
  discount_value_type: number
  mms_img_id: string
  min_order_value: string
  merchant_type: number
  custom_condition: Customcondition[]
  promotion_type: number
  promotion_id: number
  id: number
  title: Title
  max_discount_value: string
  discount_on_type: number
  browsing_icon: string
  icon: string
  card_partner: Cardpartner
  foody_service_ids: number[]
  payment_option: number[]
  discount_type: number
  display_type: number
  apply_order: number
  expired: string
  discount_amount: number
  min_order_amount: number
  discount: string
  display_order: number
  short_title: string
  home_title: string
  user_condition: Usercondition
  max_discount_amount: number
  shipping_methods: number[]
}

interface Usercondition {
  is_check_airpay_new_user?: boolean
  limit_per_user: Limitperuser[]
  is_check_recipient_phone: boolean
  platforms: any[]
  is_check_new_cardholder?: boolean
}

interface Limitperuser {
  max_usage_time: number
  period: number
}

interface Cardpartner {
  bank: Bank
  limit_per_card?: number
  card_processors?: Bank[]
}

interface Bank {
  id: number
  name: string
}

interface Title {
  message: string
}

interface Customcondition {
  content: string
  label: string
}

interface Applytime {
  apply_time_type: number
  denied_times: any[]
  allow_times: any[]
  allow_dates: Allowdate[]
  denied_dates: any[]
}

interface Allowdate {
  start_date: string
  end_date: string
}

interface Availabletime {
  date: string
  times: string[]
}

interface Rating {
  total_review: number
  avg: number
  display_total_review: string
  app_link: string
}
