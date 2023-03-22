interface DocumentDTO {
  id: number
  emitterCompanyId?: number
  serie: string
  number: number | string
  documentType: string
  filename: string
  receiverId: number
  emitterContributorId?: number
}

export default DocumentDTO
