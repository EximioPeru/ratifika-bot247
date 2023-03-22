import CompanyDTO from '../dto/CompanyDTO'
import CompanyMap from '../mappers/CompanyMap'
import { executeQueryPlain } from '../utils/database'

export const findCompanyByRuc = async (
  ruc: string
): Promise<CompanyDTO | null> => {
  try {
    const result = await executeQueryPlain<CompanyDTO>(
      'select id, number, legal_name, email_address, user_sol, clave_sol, ose from companies where number IS NOT NULL AND number = ?',
      [ruc]
    )

    return CompanyMap.toDTO(result)
  } catch (error) {
    return null
  }
}

export const findCompanyByID = async (id: number): Promise<CompanyDTO | null > => {
  try {
    const result = await executeQueryPlain<CompanyDTO>(
      'select id, number, legal_name, email_address, user_sol, clave_sol, ose from companies where id = ?',
      [id]
    )

    return CompanyMap.toDTO(result)
  } catch (error) {
    return null
  }
}
