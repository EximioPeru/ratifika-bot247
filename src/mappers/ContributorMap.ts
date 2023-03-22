import ContributorDTO from '../dto/ContributorDTO'
import Contributor from '../models/Contributor'

class ContributorMap {
  public static toDTO ({
    id,
    creator_id,
    number,
    number_type,
    legal_name,
    email_address
  }: any): ContributorDTO {
    return new Contributor(
      id,
      creator_id,
      number,
      number_type,
      legal_name,
      email_address
    )
  }
}

export default ContributorMap
