import { AbstractAPI } from './AbstractAPI'
const API_URL = process.env.API_CABINET_URL
export const studios = new AbstractAPI(`${API_URL}/settings/location`)
