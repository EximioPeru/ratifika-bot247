import { imapConfig, office365Config } from './index'
import Imap, { ImapMessage } from 'imap'
import { hoy } from '../utils/date'
import { toUpper } from '../utils/string'
import { Stream } from 'node:stream'
import { verifyAttachments, buildXOAuth2Token } from '../utils/imap'
import { ConfidentialClientApplication } from '@azure/msal-node'

class IMAPConnection {
  private static readonly IMAPConnection: IMAPConnection
  private static client: Imap

  static async start (): Promise<void> {
    const msalConfig = {
      auth: {
        clientId: office365Config.clientId,
        authority: `https://login.microsoftonline.com/${office365Config.tenantId}`,
        clientSecret: office365Config.clientSecret
      }
    }

    const cca = new ConfidentialClientApplication(msalConfig)

    const tokenRequest = {
      scopes: ['https://outlook.office365.com/.default']
    }

    const result = await cca.acquireTokenByClientCredential(tokenRequest)

    IMAPConnection.client = new Imap({
      ...imapConfig,
      xoauth2: buildXOAuth2Token(office365Config.user, result?.accessToken)
    })
    IMAPConnection.connect()
  }

  static connect (): void {
    console.log('*******************************')
    console.log('*    Conectando a IMAP')
    IMAPConnection.client.connect()
    IMAPConnection.listenEvents()
  }

  static disconnect (): void {
    IMAPConnection.client.end()
  }

  // Función para abrir el box INBOX
  static openBox (name: string = 'INBOX'): void {
    IMAPConnection.client.openBox(name, false, () => {
      console.log(`*    Conectado a box ${name}!`)
      // cuando se abre el box se obtiene los nuevos correos
      IMAPConnection.getNewMessages()
    })
  }

  // Función para certrar el box INBOX5224
  static closeBox (): void {
    console.log('closeBox')
    IMAPConnection.client.closeBox((err: Error) => {
      if (err != null) {
        console.error('error cerrando Box', err)
      }
      console.log('*    Box cerrado')
      console.log('*******************************')
    })
  }

  // Función para iniciar el escuchador de eventos
  static listenEvents (): void {
    IMAPConnection.client.once('ready', () => {
      console.log('*    Conectado')
      console.log('*******************************')
      // Cuando se conecta, abre el box INBOX para leer nuevos mensajes
      IMAPConnection.openBox()
    })

    IMAPConnection.client.on('mail', (mailNumber: number) => {
      console.log('*******************************')
      console.log('*    Total de correos:', mailNumber)
      console.log('*    Fecha:', hoy('DD/MM/YYYY HH:mm:ss'))
      console.log('*******************************')
      // Cuando llega un nuevo correo, abre el box INBOX para leer nuevos mensajes
      IMAPConnection.getNewMessages()
    })

    IMAPConnection.client.once('error', (err: Error) => {
      if (err.message === 'read ECONNRESET') {
        IMAPConnection.closeBox()
        console.log('*******************************')
        console.log('*    Error de conexión')
        console.log('*    Reconectando...')
        console.log('*******************************')
        IMAPConnection.start().then().catch((err) => {
          console.log('*  Error volviendo a conectar IMAP', err)
          console.log('*******************************')
        })
        return
      }
      console.error('*    Ocurrio un error', err)
      console.log('*******************************')
    })

    IMAPConnection.client.once('end', (err: Error) => {
      console.log('*    Conexión cerrada', err)
      console.log('*******************************')
      IMAPConnection.connect()
    })
  }

  // Función para obtener los nuevos correos
  static getNewMessages (): void {
    console.log('*******************************')
    console.log('*    Obteniendo nuevos mensajes')
    IMAPConnection.client.search(['UNSEEN'], (err: Error, results: any[]) => {
      if (err != null) console.error(err)
      console.log('*    Total de correos nuevos: ', results.length)
      console.log('*    UID de los nuevos correos: ', results.join(', '))
      if (results.length > 0) {
        // Si hay mas de un correo, se procesan los correos
        const promises = results.map(
          async (uid: any) => await IMAPConnection.processMail(uid)
        )
        Promise.all(promises)
          .then(() => {
            console.log('*******************************')
          })
          .catch((err) => {
            console.error(err)
          })
      }
      console.log('*******************************')
    })
  }

  // Función para procesar el contenido del correo
  static async processMail (uid: any): Promise<boolean> {
    return await new Promise((resolve, reject) => {
      const results = [uid]

      const f = IMAPConnection.client.fetch(results, {
        bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
        struct: true
      })

      let prefix = ''
      f.on('message', function (msg: ImapMessage, seqno: string) {
        console.log('**************************************************')
        console.log('*    Mensaje #%d', seqno)
        let email: string
        let name: string
        msg.on('body', function (stream: Stream, info) {
          let buffer: string = ''
          stream.on('data', function (chunk) {
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            buffer += chunk.toString('utf8')
          })
          stream.once('end', function () {
            const headers = Imap.parseHeader(buffer)
            email = headers.from[0].split('<')[1].split('>')[0]
            name = headers.from[0].split('<')[0].trim()
            console.log(prefix + 'De:', headers.from[0])
            console.log(prefix + 'Subject:', headers.subject)
          })
        })
        prefix = '(#' + seqno + ') '

        msg.once('attributes', function (attrs: any) {
          const attachments = IMAPConnection.findAttachmentParts(attrs.struct)
          console.log(
            prefix + 'Numero de archivos en el correo: %d',
            attachments.length
          )

          verifyAttachments(attrs, attachments, prefix, email, name)
            .then(() => {
              resolve(true)
            })
            .catch((err) => {
              reject(err)
            })
        })
        msg.once('end', function () {
          console.log(prefix + 'Se finalizó la lectura del correo')
        })
      })
      f.once('error', function (err: Error) {
        console.log('Fetch error:', err)
      })
      f.once('end', function () {
        console.log(prefix + 'Terminando de leer correo')
        IMAPConnection.setMailsAsSeen(results, prefix)
      })
    })
  }

  // Función para encontrar los archivos adjuntos en el correo
  public static findAttachmentParts (
    struct: any[],
    attachments: any[] = []
  ): any[] {
    for (const element of struct) {
      if (Array.isArray(element)) {
        IMAPConnection.findAttachmentParts(element, attachments)
      } else {
        if (
          element?.disposition != null &&
          ['INLINE', 'ATTACHMENT'].includes(toUpper(element.disposition.type))
        ) {
          attachments.push(element)
        }
      }
    }
    return attachments
  }

  // Función para marcar como visto un correo
  public static setMailsAsSeen (results: any[], prefix: string): void {
    // Función que se encarga de marcar los correos como leidos
    if (results.length > 0) {
      IMAPConnection.getClient().setFlags(results, ['\\Seen'], (err: Error) => {
        if (err != null) console.error(err)
      })
      console.log(prefix + 'Colocando correo como visto')
    }
  }

  /* public static getInstance (): IMAPConnection {
    if (IMAPConnection.IMAPConnection == null) {
      IMAPConnection.IMAPConnection = new IMAPConnection()
      IMAPConnection.IMAPConnection.connect()
    }
    return IMAPConnection.IMAPConnection
  }
 */
  public static getClient (): Imap {
    return IMAPConnection.client
  }
}

export default IMAPConnection
