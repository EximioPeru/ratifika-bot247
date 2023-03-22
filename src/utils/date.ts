import moment from 'moment-timezone'
import { config } from '../config'

export const hoy = (format: string = 'YYYY-MM-DD'): string => {
  return moment().tz(config.tz).format(format)
}

export const getDate = (): Date => {
  return moment().tz(config.tz).toDate()
}
