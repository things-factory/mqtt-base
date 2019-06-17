import { CONNECT, SUBSCRIBE, UNSUBSCRIBE, PUBLISH, DISCONNECT } from '../actions/mqtt'
import * as MQTT from 'mqtt'

const INITIAL_STATE = {
  mqtt: {
    connections: {}
  }
}

function getConnection(connections, brokerUrl) {
  return connections[brokerUrl]
}

function connect(brokerUrl) {
  return MQTT.connect(brokerUrl)
}

function subscribe(client, topic, handler) {
  client.subscribe(topic, handler)
}

function unsubscribe(client, topic) {
  client.unsubscribe(topic)
}

function publish(client, topic, message) {
  client.publish(topic, message)
}

function disconnect(client) {
  client.end()
}

const mqtt = (state = INITIAL_STATE, action) => {
  let connection
  let client

  switch (action.type) {
    case CONNECT:
      connection = getConnection(state.mqtt.connections, action.brokerUrl)

      if (!connection) {
        client = connect(action.brokerUrl)
        state.mqtt.connections[action.brokerUrl] = {
          brokerUrl: action.brokerUrl,
          client
        }
      }

      return { ...state }

    case SUBSCRIBE:
      // 1. checking params exsist or not (brokerUrl, topic, message)
      if (!action.brokerUrl || !action.topic || !action.message) return

      // 2. if there's brokerUrl check whether connection is exist or not.
      connection = getConnection(state.mqtt.connections, action.brokerUrl)
      client
      if (!connection) {
        client = connect(action.brokerUrl)
        state.mqtt.connections[action.brokerUrl] = {
          brokerUrl: action.brokerUrl,
          client
        }
      } else {
        client = connection.client
      }

      // 4. start to subscribe
      subscribe(client, action.topic, action.handler)

      return { ...state }

    case UNSUBSCRIBE:
      if (!action.brokerUrl || !action.topic) return

      // 1. we need to pop out the client of connection (brokerUrl)
      connection = getConnection(state.mqtt.connections, action.brokerUrl)
      if (!connection) return

      client = connection.client

      // 2. unsubscribe the topic
      unsubscribe(client, action.topic)
      return

    case PUBLISH:
      // 1. validate connection (brokerUrl, topic, message)
      if (!action.brokerUrl || !action.topic || !action.message) return

      connection = getConnection(state.mqtt.connections, action.brokerUrl)
      if (!connection) return

      client = connection.client
      // 2. publish message to the topic, if we need to get data from UI, use action.<<param>>
      publish(client, action.topic, action.message)

      return

    case DISCONNECT:
      if (!action.brokerUrl) return

      connection = getConnection(state.mqtt.connections, action.brokerUrl)

      if (!connection) return
      client = connection.client

      disconnect(client)
      delete state.mqtt.connections[action.brokerUrl]

      return { ...state }

    default:
      return state
  }
}

export default mqtt
