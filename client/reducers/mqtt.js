import { SUBSCRIBE, UNSUBSCRIBE, PUBLISH, DISCONNECT } from '../actions/mqtt'
import * as MQTT from 'mqtt'

const INITIAL_STATE = {
  mqtt: {
    client: '',
    brokerUrl: '',
    topics: []
  }
}

function subscribe(client, brokerUrl, topic, handler) {
  return new Promise(resolve => {
    if (client) {
      client.subscribe(topic)
      client.on('message', handler)

      resolve(client)
    } else {
      client = MQTT.connect(brokerUrl, {
        connectTimeout: 3000,
        keepalive: 3
      })
      client.on('connect', () => {
        client.subscribe(topic)
        client.on('message', handler)

        resolve(client)
      })
    }
  })
}

function unsubscribe(client, topic) {
  if (!client) return
  client.unsubscribe(topic)
}

function publish(client, topic, message) {
  if (!client) return
  client.publish(topic, message)
}

function disconnect(client) {
  if (!client) return
  client.end()
}

const mqtt = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SUBSCRIBE:
      subscribe(state.mqtt.client, action.brokerUrl, action.topic, action.handler).then(client => {
        state.mqtt.client = client

        return {
          ...state,
          client,
          brokerUrl: action.brokerUrl,
          topics: [...state.mqtt.topics, action.topic]
        }
      })

    case UNSUBSCRIBE:
      unsubscribe(state.mqtt.client, action.topic)
      return {
        ...state,
        brokerUrl: action,
        topics: state.mqtt.topics.filter(t => t !== action.topic)
      }

    case PUBLISH:
      publish(state.mqtt.client, action.topic, action.message)
      return { ...state }

    case DISCONNECT:
      disconnect(state.mqtt.client)
      return { ...state }

    default:
      return state
  }
}

export default mqtt
