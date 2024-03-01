import { createLibp2p } from 'libp2p'
import { multiaddr } from '@multiformats/multiaddr'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { webTransport } from '@libp2p/webtransport'
import { mplex } from '@libp2p/mplex'
import { yamux } from '@chainsafe/libp2p-yamux'
import { noise } from '@chainsafe/libp2p-noise'
import { bootstrap } from '@libp2p/bootstrap'
import { identify } from '@libp2p/identify'
import { kadDHT } from '@libp2p/kad-dht'
import { webRTCDirect } from '@libp2p/webrtc'

// example: /demo5.html?/ip4/127.0.0.1/udp/36338/quic-v1/webtransport/...
const bootstrapMultiAddress = location.search.replace(/^\?/, '')

;(async () => {
  const libp2p = await createLibp2p({
    peerDiscovery: [
      bootstrap({list: [bootstrapMultiAddress]})
    ],
    transports: [
      webTransport(),
      webRTCDirect()
    ],
    streamMuxers: [yamux(), mplex()],
    connectionEncryption: [noise()],
    connectionGater: {
      // not sure why needed, doesn't connect without it
      denyDialMultiaddr: async () => false,
    },
    services: {
      identify: identify(),
      dht: kadDHT({}),
      pubsub: gossipsub({allowPublishToZeroPeers: true})
    }
  })

  // pubsub sub
  const pubsubTopic = 'demo'
  libp2p.services.pubsub.addEventListener('message', (evt) => {
    log(`${evt.detail.from}: ${new TextDecoder().decode(evt.detail.data)} on topic ${evt.detail.topic}`)
  })
  await libp2p.services.pubsub.subscribe(pubsubTopic)

  // pubsub pub
  setInterval(() => {
    libp2p.services.pubsub.publish(pubsubTopic, new TextEncoder().encode(`demo message from browser ${libp2p.peerId}`)).catch(console.error)
  }, 2000)
})()

function log(...args) {
  console.log(...args)
  const p = document.createElement('p')
  p.textContent = JSON.stringify(...args)
  document.body.prepend(p)  
}
