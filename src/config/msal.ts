import { imapConfig } from './index'
import { ConfidentialClientApplication } from '@azure/msal-node'
import Imap from 'imap'

export async function login (): Promise<void> {
  const msalConfig = {
    auth: {
      clientId: '7bc8c592-9161-4dae-8e20-38ba94b24c7d',
      authority: 'https://login.microsoftonline.com/286b53ab-afc2-407c-ac23-4581cba49a24/',
      clientSecret: 'pa68Q~JD_SEjMMgYrV5OMX71M_8uycOghCZaNdcr'
      // knownAuthorities: [config.imap.authority] not sure about this option, I didn't need to include it
    }
  }

  const tokenRequest = {
    scopes: ['https://outlook.office365.com/.default'] // this was my main point of failure, I was first using the graph url
  }

  // this function encodes the token into the XOAuth2 format needed by imap:
  const _build_XOAuth2_token = (user = '', access_token = ''): string => Buffer
    .from([`user=${user}`, `auth=Bearer ${access_token}`, '', '']
      .join('\x01'), 'utf-8')
    .toString('base64')

  try {
    // here you log in and get the token for the outlook scope:
    const cca = new ConfidentialClientApplication(msalConfig)
    const authResponse = await cca.acquireTokenByClientCredential(tokenRequest)
    const token = authResponse?.accessToken
    // here you build the imap object using the token formatted by the function above:

    const imap = new Imap({
      user: '',
      password: '',
      xoauth2: _build_XOAuth2_token(imapConfig.user, token),
      host: 'outlook.office365.com',
      port: 993,
      tls: true,
      tlsOptions: {
        rejectUnauthorized: false,
        servername: 'outlook.office365.com'
      },
      debug: console.log
    })
    imap.once('ready', () => {
      console.log('*    Conectado2')
      console.log('*******************************')
      // Cuando se conecta, abre el box INBOX para leer nuevos mensajes
    })
  } catch (err) {
    console.log('AUTH ERROR')
    console.log(err)
  }
}
