/**
 * simulate download
 */

export default function download (filename, href) {
  const pom = document.getElementById('a')
  pom.setAttribute('href', href)
  pom.setAttribute('download', filename)
  pom.click()
}
