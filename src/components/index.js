import TabBar from './tab-bar'
import GoBack from './go-back'
import Popup from './popup'

const components = {
  TabBar,
  GoBack,
  Popup,
}

const install = (app) => {
  Object.keys(components).forEach((key) => {
    app.component(components[key]['name'], components[key])
  })
}

const Mui = { install }

export default Mui
