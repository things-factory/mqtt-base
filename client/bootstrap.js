import { store } from '@things-factory/shell'
import mqtt from './reducers/mqtt'

export default function bootstrap() {
  store.addReducers({
    mqtt
  })
}
