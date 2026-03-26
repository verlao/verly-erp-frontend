import api from './api'

export interface AccessoryCostInlineUpdateResponse {
  created: boolean
  id: number
  type: string
  sheets: number
  width?: number
  height?: number
  oldValue: number
  newValue: number
  message: string
}

const accessoryCostService = {
  updateInline: async (
    type: string,
    sheets: number,
    width: number,
    height: number,
    accessoryValue: number
  ): Promise<AccessoryCostInlineUpdateResponse> => {
    const response = await api.patch(
      `/api/accessory-costs/inline/${type}/${sheets}/${width}/${height}`,
      { accessoryValue }
    )
    return response.data
  }
}

export default accessoryCostService
