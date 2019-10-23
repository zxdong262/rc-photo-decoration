/**
 * simulate download
 */

// export default function download (filename, href) {
//   const pom = document.getElementById('a')
//   pom.setAttribute('href', href)
//   pom.setAttribute('download', filename)
//   pom.click()
// }
import fetch from './fetch'

export default async function download (filename, href) {
  let res = await fetch.post('http://html5beta.com:6066/download', {
    image: href,
    filename
  }, {
    mode: 'cors'
  })
  console.log('res', res)
  if (res && res.id) {
    const pom = document.getElementById('a')
    pom.setAttribute('href', 'http://html5beta.com:6066/download?id=' + res.id)
    pom.setAttribute('download', filename)
    pom.click()
  }
}
