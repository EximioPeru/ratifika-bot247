import { getAndSaveCDR } from './../service/cdrService'
import {
  writeStream,
  validateAttachmentTypeFile,
  containsCPEptXml
} from './files'
import { ImapMessage } from 'imap'
import IMAPConnection from '../config/imap'
import Mail from '../config/mail'
import { hoy } from './date'
import { v4 as uuid } from 'uuid'

// Función para verificar que los archivos adjuntos sean los correctos y procesarlos
export const verifyAttachments = async (
  attrs: any,
  attachments: any[],
  prefix: string,
  email: string,
  name: string
): Promise<void> => {
  try {
    const promises = []
    let hasXmlOrZipFile = false
    // Se valida si el correo tiene archivos adjuntos de tipo XML o ZIP
    for (const attachment of attachments) {
      console.log(prefix + 'Archivo adjunto ', attachment?.params?.name)
      if (hasXmlOrZipFile) break
      if (validateAttachmentTypeFile(attachment.params.name, ['xml', 'zip', 'XML', 'ZIP'])) {
        hasXmlOrZipFile = true
      }
    }
    // Si el correo no tiene archivos adjuntos de tipo XML o ZIP, se procesan
    if (!hasXmlOrZipFile) {
      console.log(prefix + 'No se encontraron adjuntos válidos')
      return
    }

    const tempDirectory = uuid()

    for (let i = 0, len = attachments.length; i < len; ++i) {
      const attachment = attachments[i]
      // Si los archivos no son los validos se salta el archivo
      if (!validateAttachmentTypeFile(attachment.params.name)) continue

      const promise = new Promise((resolve, reject) => {
        // Se obtiene el archivo adjunto
        const f = IMAPConnection.getClient().fetch(attrs.uid, {
          bodies: [attachment.partID],
          struct: true
        })
        // Se procesa el archivo adjunto
        f.on('message', (msg: ImapMessage) => {
          buildAttachmentMessage(attachment, msg, tempDirectory)
            .then((filenames: string[]) => {
              resolve(filenames)
            })
            .catch((err) => {
              reject(err)
            })
        })
      })

      promises.push(promise)
    }

    const response = await Promise.all(promises)
    const filePaths = response.flat() as string[]
    if (containsCPEptXml(filePaths)) {
      // contiene un comprobante
      console.log(prefix + 'Se encontró un xml válido')
      // Obtiene CDR, lo guarda y lo valida si el CPE es correcto y envía el correo
      const data = await getAndSaveCDR(filePaths, prefix)
      // Envia un email si esta mal o esta bien el CPE
      const emailToSend = data?.email != null ? data.email : email
      if (data != null) {
        const fileCPE = data.fileName.split('\\').pop()
        await Mail.getMail().sendMail(
          'validateCPE',
          {
            companyName: data.companyName != null ? data.companyName : name,
            email: emailToSend,
            filename: fileCPE,
            message: data.isValid
              ? 'El Documento ha sido aceptado por SUNAT'
              : `El Documento ha sido rechazado por SUNAT ${String(
                  data.observationError
                )}`,
            year: hoy('YYYY')
          },
          emailToSend,
          'Ratifika - Validación de CPE',
          prefix
        )
        console.log(prefix, 'Correo enviado')
      }
    }
  } catch (error) {
    console.log(
      prefix + 'Error obteniendo los archivos contenidos en el correo',
      error
    )
    console.error(error)
  }
}

// Función que se encarga de construir la función que se encarga de guardar los archivos
export const buildAttachmentMessage = async (
  attachment: any,
  msg: ImapMessage,
  directory: string
): Promise<string[]> => {
  const filename = attachment.params.name
  const encoding = attachment.encoding
  return await new Promise((resolve, reject) => {
    msg.on('body', function (stream, info) {
      writeStream(stream, filename, encoding, directory)
        .then((filenames: string[]) => {
          resolve(filenames)
        })
        .catch((err) => {
          console.error(err)
          reject(err)
        })
    })
    msg.once('error', function (err) {
      reject(err)
    })
  })
}

// Funcion para convertir token en formato XOauth2

export const buildXOAuth2Token = (user = '', access_token = ''): string => Buffer
  .from([`user=${user}`, `auth=Bearer ${access_token}`, '', '']
    .join('\x01'), 'utf-8')
  .toString('base64')
