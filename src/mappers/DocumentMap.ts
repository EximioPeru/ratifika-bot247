import DocumentDTO from '../dto/DocumentDTO'
import Document from '../models/Document'

class DocumentMap {
  public static toDTO ({
    id,
    emitter_contributor_id,
    emitter_company_id,
    receiver_id,
    serie,
    number,
    document_type,
    file_name
  }: any): DocumentDTO {
    return new Document(
      id,
      emitter_contributor_id,
      emitter_company_id,
      serie,
      number,
      document_type,
      file_name,
      receiver_id
    )
  }
}

export default DocumentMap
