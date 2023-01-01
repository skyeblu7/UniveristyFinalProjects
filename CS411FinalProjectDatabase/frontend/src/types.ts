export interface CardData {
    card_id: number, // card id in the DB
    card_name: string, // card name 
    bank?: string, // bank name
    annual_fee?: number, // annual fee
    credit_limit?: number, // credit limit
    signup_bonus?: number, // signup bonus
    APR_min?: number, // min APR
    APR_max?: number, // max APR
    foreign_trans_fee?: number, // foreign transaction fee
    reward_type?: string, // length 1 string representing reward type
    signup_link?: string, // signup link
    min_rec_credit?: number, // minimum recommended credit
    image_url?: string, // image url
    processor_id?: string, // processor name
  }

  export interface PaymentProcessors {
    id: number, // processor id
    name: string, // processor name
    domestic_accept: number, // domestic acceptance
    international_accept: number, // international acceptance
    total_card_us: number, // total number of cards in the US
    total_vol_us: number, // total volume in the US
    num_trans:  number, // number of transactions
    avg_proc_fee: number, // average processing fee
  }

  export interface TrendingCard {
    card_name: string,
    views: number,
  }