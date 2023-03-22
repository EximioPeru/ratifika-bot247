import CompanyDTO from '../dto/CompanyDTO'

class Company implements CompanyDTO {
  id: number
  number: string | number
  legalName: string
  emailAddress: string
  userSol?: string
  claveSol?: string
  ose?: string

  constructor (
    id: number,
    number: string | number,
    legalName: string,
    emailAddress: string,
    userSol?: string,
    claveSol?: string,
    ose?: string
  ) {
    this.id = id
    this.number = number
    this.legalName = legalName
    this.emailAddress = emailAddress
    this.userSol = userSol
    this.claveSol = claveSol
    this.ose = ose
  }
}

export default Company
