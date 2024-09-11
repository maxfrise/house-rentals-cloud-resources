import {House} from "../../common/types/house"

export interface Responsebody {
  houses: House[];
  message: string
}

export interface Body {
  landlord: string
}

