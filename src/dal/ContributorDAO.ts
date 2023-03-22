import ContributorDTO from '../dto/ContributorDTO'
import ContributorMap from '../mappers/ContributorMap'
import { executeQueryPlain } from '../utils/database'

export const findContributorByID = async (id: number): Promise<ContributorDTO | null > => {
  try {
    const result = await executeQueryPlain<ContributorDTO>(
      'select id, number, legal_name, email_address, user_sol, clave_sol, ose from companies where id = ?',
      [id]
    )

    return ContributorMap.toDTO(result)
  } catch (error) {
    return null
  }
}
