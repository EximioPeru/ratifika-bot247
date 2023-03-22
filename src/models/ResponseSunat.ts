import ResponseSunatCDRDTO from '../dto/ResponseSunatCDRDTO'

class ResponseSunat implements ResponseSunatCDRDTO {
  content: string
  statusCode: string
  statusMessage: string

  constructor (content: string, statusCode: string, statusMessage: string) {
    this.content = content
    this.statusCode = statusCode
    this.statusMessage = statusMessage
  }
}

export default ResponseSunat
