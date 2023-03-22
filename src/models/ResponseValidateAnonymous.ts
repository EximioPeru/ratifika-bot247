import ResponseValidateAnonymousDTO from '../dto/ResponseValidateAnonymousDTO'

class ResponseValidateAnonymous implements ResponseValidateAnonymousDTO {
  result: boolean
  resultDesc?: string
  fileName?: string
  stateDoc?: string
  stateDocDesc?: string
  stateRuc?: string
  stateRucDesc?: string
  addressCondition?: string
  addressConditionDesc?: string
  isUnadjudicated?: boolean

  constructor (
    result: boolean,
    resultDesc?: string,
    fileName?: string,
    stateDoc?: string,
    stateDocDesc?: string,
    stateRuc?: string,
    stateRucDesc?: string,
    addressCondition?: string,
    addressConditionDesc?: string,
    isUnadjudicated?: boolean
  ) {
    this.result = result
    this.resultDesc = resultDesc
    this.fileName = fileName
    this.stateDoc = stateDoc
    this.stateDocDesc = stateDocDesc
    this.stateRuc = stateRuc
    this.stateRucDesc = stateRucDesc
    this.addressCondition = addressCondition
    this.addressConditionDesc = addressConditionDesc
    this.isUnadjudicated = isUnadjudicated
  }
}

export default ResponseValidateAnonymous
