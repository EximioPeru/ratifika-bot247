import ejs from 'ejs'
import path from 'path'

export const renderTemplate = async (template: string, content: any): Promise<string> =>
  await new Promise((resolve, reject) => {
    const templatePath = path.join(__dirname, `../templates/${template}.ejs`)
    ejs.renderFile(templatePath, content, (err, data) => {
      if (err != null) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
