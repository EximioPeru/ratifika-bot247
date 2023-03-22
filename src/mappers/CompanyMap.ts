import CompanyDTO from '../dto/CompanyDTO'
import Company from '../models/Company'

class CompanyMap {
  public static toDTO ({
    id,
    number,
    legal_name,
    email_address,
    user_sol,
    clave_sol,
    ose
  }: any): CompanyDTO {
    return new Company(
      id,
      number,
      legal_name,
      email_address,
      user_sol,
      clave_sol,
      ose
    )
  }
}

export default CompanyMap
