import ResponseValidateAnonymousDTO from '../dto/ResponseValidateAnonymousDTO'
import ResponseValidateAnonymous from '../models/ResponseValidateAnonymous'

class ResponseValidateAnonymouseMap {
  public static toDTO = ({
    result,
    result_desc,
    file_name,
    state_doc,
    state_doc_desc,
    state_ruc,
    state_ruc_desc,
    address_condition,
    address_condition_desc,
    is_unadjudicated
  }: any): ResponseValidateAnonymousDTO => {
    return new ResponseValidateAnonymous(
      result,
      result_desc,
      file_name,
      state_doc,
      state_doc_desc,
      state_ruc,
      state_ruc_desc,
      address_condition,
      address_condition_desc,
      is_unadjudicated
    )
  }
}

export default ResponseValidateAnonymouseMap
