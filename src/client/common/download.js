/**
 * simulate download
 */

export default function download (filename, href) {
  var pom = document.createElement('a')
  pom.setAttribute('href', href)
  pom.setAttribute('download', filename)
  if (document.createEvent) {
    const event = document.createEvent('MouseEvents')
    event.initEvent('click', true, true)
    pom.dispatchEvent(event)
  } else {
    pom.click()
  }
}
