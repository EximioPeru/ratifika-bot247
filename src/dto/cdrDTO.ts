interface cdrDTO {
  responseDescription?: string
  observationCode?: number
  observationDescription?: string
  dateEmission?: string
  billHash?: string
  documentId?: number
  fileId?: number
  emitterContributorId?: number
  emitterCompanyId?: number
}

export default cdrDTO
