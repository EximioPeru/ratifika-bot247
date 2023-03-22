class Contributor {
  id: number
  creatorId?: number
  number: string
  numberType: number
  legalName: string
  emailAddress: string

  constructor (id: number, creatorId: number, number: string, numberType: number, legalName: string, emailAddress: string) {
    this.id = id
    this.creatorId = creatorId
    this.number = number
    this.numberType = numberType
    this.legalName = legalName
    this.emailAddress = emailAddress
  }
}

export default Contributor
