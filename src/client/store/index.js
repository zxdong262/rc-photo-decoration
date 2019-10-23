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
    frameWidth: 5,
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
  getBaseImg () {
    return document.getElementById('img_base')
  },
  getIconImg (name) {
    return document.getElementById(`img_${name}`)
  },
  get iconObj () {
    return store.icons.find(n => n.name === store.icon)
  },
  renderCanvases () {

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
      store.image = imageDefault(base, copy(store.iconObj))
    }
  },
  handleFile (file) {
    console.log(file)
    store.fileId = file.uid
    store.file = () => file
    return false
  },
  onClickIcon (icon) {
    store.icon = icon.name
  },
  download () {
    const image = document.getElementById('download')
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream')
    return download(image)
  },
  async renderOne (id, config) {
    const canvas = document.getElementById(id)
    if (!canvas) {
      return
    }
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = config.bgColor
    let file = store.file()
    if (!file) {
      file = store.getBaseImg()
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
      const width = 90
      const config = imageDefault(width, icon)
      config.baseImageName = 'img_p' + (i + 1)
      await store.renderOne('icon_' + icon.name, config)
    }
    store.loading = false
  }
})

SubX.autoRun(store, () => {
  store.renderCanvases()
  return store.image
})

SubX.autoRun(store, () => {
  store.renderIcons()
  store.renderCanvases()
  return store.fileId
})

fromEvent(window, 'resize')
  .pipe(debounceTime(1000))
  .subscribe(
    store.resize
  )
export default store
