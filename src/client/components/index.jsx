import { Component } from 'react-subx'
import { Button, Upload, Tag, Spin } from 'antd'
import classnames from 'classnames'
import p1 from '../images/p1.png'
import p2 from '../images/p2.png'
import p3 from '../images/p3.png'
import base from '../images/base.jpg'

export default class App extends Component {
  componentDidMount () {
    this.props.store.resize()
    this.props.store.fileId = 'n'
  }

  renderTitle () {
    return (
      <div className='pd2b aligncenter'>
        <h1>
          RC photo decoration tool
          <sup className='mg1l'><Tag color='red'>Beta</Tag></sup>
        </h1>
      </div>
    )
  }

  renderFooter () {
    return (
      <div className='mg3t pd1y'>
        <p>Cat image from gratisography.com, Curious Cat Free Photo, By Ryan McGuire</p>
        <p>
          Powered by
          <a href='https://github.com/tylerlong/subx' target='_blank' className='mg1x'>Subx</a>
        </p>
      </div>
    )
  }

  renderWorkSpace () {
    const { width, height } = this.props.store.image
    return (
      <div className='canvas-wrap'>
        <canavs
          id='pre'
          width={width}
          height={height}
        />
        <div className='hide'>
          <canavs
            id='r_pre'
            width={width}
            height={height}
          />
        </div>
      </div>
    )
  }

  renderControl () {
    let props = {
      showUploadList: false,
      beforeUpload: this.props.store.handleFile,
      accept: '.png,.jpg,.gif'
    }
    return (
      <div className='control-wrap'>
        <Upload
          {...props}
        >
          <Button>Select photo</Button>
        </Upload>
        <Button
          onClick={this.props.store.download}
          className='mg1l'
        >Download</Button>
        <div className='hide'>
          <img src={p1} id='img_p1' />
          <img src={p2} id='img_p2' />
          <img src={p3} id='img_p3' />
          <img src={base} id='img_base' />
          <canavs
            id='download'
            width={840}
            height={840}
          />
          <canavs
            id='r_download'
            width={840}
            height={840}
          />
        </div>
      </div>
    )
  }

  renderIcon = (icon) => {
    let isCurrent = icon.name === this.props.store.icon
    let cls = classnames('icon', {
      active: isCurrent
    })
    return (
      <div
        className={cls}
        onClick={
          () => this.props.store.onClickIcon(icon)
        }
      >
        <canvas
          id={'icon_' + icon.name}
          width={90}
          height={90}
        />
        <canvas
          id={'r_icon_' + icon.name}
          className='hide'
          width={90}
          height={90}
        />
      </div>
    )
  }

  renderIcons () {
    const { icons } = this.props.store
    return (
      <div className='icons'>
        {icons.map(this.renderIcon)}
      </div>
    )
  }

  render () {
    return (
      <div className='main'>
        {this.renderTitle()}
        <Spin spinning={this.props.store.loading}>
          {this.renderWorkSpace()}
          {this.renderControl()}
          {this.renderFooter()}
        </Spin>
      </div>
    )
  }
}
