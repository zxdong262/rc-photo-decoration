// the final fetch wrapper
const log = window.console
const jsonHeader = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
}

function parseResponse (response) {
  const contentType = response.headers.get('content-type') || ''
  const isJsonResult = contentType.toLowerCase().includes('application/json')
  return isJsonResult ? response.json() : response.text()
}

export async function handleErr (res) {
  log.debug(res)
}

export default class Fetch {
  static get (url, data, options) {
    return Fetch.connect(url, 'get', null, options)
  }

  static post (url, data, options) {
    return Fetch.connect(url, 'post', data, options)
  }

  static connect (url, method, data, options = {}) {
    const body = {
      method,
      body: data
        ? JSON.stringify(data)
        : undefined,
      headers: jsonHeader,
      timeout: 180000,
      ...options
    }
    return window.fetch(url, body)
      .then(res => {
        if (res.status > 304) {
          throw res
        }
        return res
      })
      .then(options.handleResponse || parseResponse, options.handleErr || handleErr)
  }
}
