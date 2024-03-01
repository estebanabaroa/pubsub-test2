import { createHelia } from 'helia'
import { libp2pDefaults } from './node_modules/helia/dist/src/utils/libp2p-defaults.browser.js'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { bootstrap } from '@libp2p/bootstrap'

// example: /demo5.html?/ip4/127.0.0.1/udp/36338/quic-v1/webtransport/...
const bootstrapMultiAddress = location.search.replace(/^\?/, '')

;(async () => {
  // create libp2p options with pubsub and custom boostrap
  const libp2pOptions = libp2pDefaults()
  libp2pOptions.services.pubsub = gossipsub({allowPublishToZeroPeers: true})
  delete libp2pOptions.services.delegatedRouting
  libp2pOptions.peerDiscovery = [bootstrap({list: [bootstrapMultiAddress]})]
  // not sure why needed, doesn't connect without it
  libp2pOptions.connectionGater = {denyDialMultiaddr: async () => false}

  const helia = await createHelia({libp2p: libp2pOptions})

  // pubsub sub
  const pubsubTopic = 'demo'
  helia.libp2p.services.pubsub.addEventListener('message', (evt) => {
    log(`${evt.detail.from}: ${new TextDecoder().decode(evt.detail.data)} on topic ${evt.detail.topic}`)
  })
  await helia.libp2p.services.pubsub.subscribe(pubsubTopic)

  // pubsub pub
  setInterval(() => {
    helia.libp2p.services.pubsub.publish(pubsubTopic, new TextEncoder().encode(`demo message from browser ${helia.libp2p.peerId}`)).catch(console.error)
  }, 2000)
})()

function log(...args) {
  console.log(...args)
  const p = document.createElement('p')
  p.textContent = JSON.stringify(...args)
  document.body.prepend(p)  
}
