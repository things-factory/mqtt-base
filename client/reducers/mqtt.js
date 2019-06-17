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
  client.subscribe(topic, function(error) {
    if (!error) {
      client.on('message', handler)
    }
  })
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
  const connection = getConnection(state.mqtt.connections, action.brokerUrl)
  let client = (connection && connection.client) || null

  switch (action.type) {
    case CONNECT:
      if (!client) {
        client = connect(action.brokerUrl)
        state.mqtt.connections[action.brokerUrl] = {
          brokerUrl: action.brokerUrl,
          client
        }
      }

      return { ...state }

    case SUBSCRIBE:
      // 1. checking params exsist or not (brokerUrl, topic, message)
      if (action.brokerUrl && action.topic && action.handler) {
        // 2. if there's brokerUrl check whether connection is exist or not.
        if (!client) {
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
      }

      return { ...state }

    case UNSUBSCRIBE:
      if (action.brokerUrl && action.topic && client) {
        // 1. we need to pop out the client of connection (brokerUrl)
        // 2. unsubscribe the topic
        unsubscribe(client, action.topic)
      }

      return { ...state }

    case PUBLISH:
      // 1. validate connection (brokerUrl, topic, message)
      if (action.brokerUrl && action.topic && action.message && client) {
        // 2. publish message to the topic, if we need to get data from UI, use action.<<param>>
        publish(client, action.topic, action.message)
      }

      return { ...state }

    case DISCONNECT:
      if (action.brokerUrl && client) {
        disconnect(client)
        delete state.mqtt.connections[action.brokerUrl]
      }

      return { ...state }

    default:
      return state
  }
}

export default mqtt
