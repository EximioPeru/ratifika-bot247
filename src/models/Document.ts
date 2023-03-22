import DocumentDTO from '../dto/DocumentDTO'

class Document implements DocumentDTO {
  id: number
  emitterCompanyId: number
  serie: string
  number: string
  documentType: string
  filename: string
  receiverId: number
  emitterContributorId?: number

  constructor (
    id: number,
    emitterContributorId: number,
    emitterCompanyId: number,
    serie: string,
    number: string,
    documentType: string,
    filename: string,
    receiverId: number
  ) {
    this.id = id
    this.emitterContributorId = emitterContributorId
    this.emitterCompanyId = emitterCompanyId
    this.serie = serie
    this.number = number
    this.documentType = documentType
    this.filename = filename
    this.receiverId = receiverId
  }
}

export default Document
