import SubX from 'subx'
import { fromEvent } from 'rxjs'
import { debounceTime } from 'rxjs/operators'
import copy from 'json-deep-copy'
import download from '../common/download'

const icons = [
  {
    name: 'p1',
    width: 800,
    height: 338,
    boxSize: 840,
    left: 20,
    top: 820 - 338,
    round: true
  },
  {
    name: 'p2',
    width: 800,
    height: 184,
    boxSize: 840,
    left: 20,
    top: 820 - 184
  },
  {
    name: 'p3',
    width: 382,
    height: 246,
    boxSize: 840,
    left: 20,
    top: 20
  }
]

const imageDefault = (width = 500, icon = icons[0]) => {
  let f = width / icon.boxSize
  return {
    width,
    height: width,
    iconWidth: icon.width * f,
    iconHeight: icon.height * f,
    iconName: icon.name,
    iconPosition: {
      left: icon.left * f,
      top: icon.top * f
    },
    round: !!icon.round,
    frameWidth: 20 * f,
    frameColor: '#ffffff',
    bgColor: '#aaaaaa'
  }
}

const store = SubX.create({
  image: imageDefault(),
  icons: copy(icons),
  icon: 'p1',
  loading: false,
  file: () => null,
  fileId: '',
  downloadImageSize: 840,
  iconImageSize: 90,
  getBaseImg () {
    return document.getElementById('img_base')
  },
  getIconImg (name) {
    return document.getElementById(`img_${name}`)
  },
  get iconObj () {
    return icons.find(n => n.name === store.icon)
  },
  async renderCanvases () {
    const id1 = 'preview'
    const config = copy(store.image)
    await store.renderOne(id1, config)
    const id2 = 'download'
    const config2 = imageDefault(
      store.downloadImageSize,
      store.iconObj
    )
    await store.renderOne(id2, config2)
  },
  resize () {
    let { innerWidth } = window
    const { width } = imageDefault()
    let base = width
    if (innerWidth < 320) {
      base = 320 - 20
    } else if (innerWidth >= 520) {
      base = width
    } else {
      base = innerWidth - 20
    }
    if (base !== store.image.width) {
      store.image = imageDefault(base, store.iconObj)
    }
  },
  handleFile (files) {
    const file = files[0].file
    console.log(file)
    file.uid = file.name + '_' + file.size + '_' + file.lastModified
    store.file = () => file
    store.fileId = file.uid
    store.renderIcons()
    store.renderCanvases()
    return false
  },
  onClickIcon (icon) {
    store.icon = icon.name
    store.image = imageDefault(
      store.image.width,
      store.iconObj
    )
  },
  download () {
    // from https://stackoverflow.com/questions/8126623/downloading-canvas-element-to-an-image
    let canvasImage = document.getElementById('download').toDataURL('image/png')

    // this can be used to download any image from webpage to local disk
    let xhr = new window.XMLHttpRequest()
    xhr.responseType = 'blob'
    xhr.onload = function () {
      let a = document.createElement('a')
      a.href = window.URL.createObjectURL(xhr.response)
      a.download = 'rc-deced.png'
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      a.remove()
    }
    xhr.open('GET', canvasImage) // This is to download the canvas Image
    xhr.send()
  },
  getImageFromFile (file) {
    return new Promise((resolve) => {
      if (window.rcimg && window.rcimg.id === file.uid) {
        console.log('use cache')
        return resolve(window.rcimg.img)
      }
      const reader = new window.FileReader()
      reader.onload = (event) => {
        const img = new window.Image()
        img.onload = () => {
          window.rcimg = {
            id: file.uid,
            img: img
          }
          console.log('resolve cache')
          resolve(img)
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(file)
    })
  },
  async getRoundImage (id, config, image) {
    const canvas = document.getElementById(`r_${id}`)
    if (!canvas) {
      return
    }
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, config.width, config.height)
    ctx.fillStyle = config.bgColor
    ctx.fill()
    const r = config.width / 2 - config.frameWidth
    ctx.strokeStyle = config.frameColor
    ctx.lineWidth = config.frameWidth
    ctx.arc(r, r, r, 0, 2 * Math.PI, false)
    ctx.stroke()
    ctx.clip()
    ctx.drawImage(
      image, 0, 0, config.width, config.height
    )
    return canvas
  },
  async renderOne (id, config) {
    const canvas = document.getElementById(id)
    if (!canvas) {
      return
    }
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, config.width, config.height)
    ctx.fillStyle = config.bgColor
    ctx.fill()
    let file = store.file()
    if (!file) {
      file = store.getBaseImg()
    } else {
      file = await store.getImageFromFile(file)
    }
    if (config.round) {
      file = await store.getRoundImage(id, config, file)
    }
    ctx.drawImage(
      file, 0, 0, config.width, config.height
    )
    const iconImage = store.getIconImg(config.iconName)
    ctx.drawImage(
      iconImage,
      config.iconPosition.left,
      config.iconPosition.top,
      config.iconWidth,
      config.iconHeight
    )
  },
  async renderIcons () {
    const len = icons.length
    store.loading = true
    for (let i = 0; i < len; i++) {
      const icon = icons[i]
      const width = store.iconImageSize
      const config = imageDefault(width, icon)
      config.baseImageName = 'img_p' + (i + 1)
      await store.renderOne('icon_' + icon.name, config)
    }
    store.loading = false
  }
})

SubX.autoRun(store, () => {
  console.log('store.image.width change')
  store.renderCanvases()
  return store.image
})

fromEvent(window, 'resize')
  .pipe(debounceTime(1000))
  .subscribe(
    store.resize
  )
export default store
