import { createLibp2p } from 'libp2p'
import { peerIdFromString } from '@libp2p/peer-id'
import { multiaddr } from '@multiformats/multiaddr'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { webTransport } from '@libp2p/webtransport'
import { mplex } from '@libp2p/mplex'
import { yamux } from '@chainsafe/libp2p-yamux'
import { noise } from '@chainsafe/libp2p-noise'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { bootstrap } from '@libp2p/bootstrap'
import { identify } from '@libp2p/identify'
import { kadDHT } from '@libp2p/kad-dht'
import { webRTCDirect } from '@libp2p/webrtc'
import { webSockets } from '@libp2p/websockets'
import { createHelia } from 'helia'
import { libp2pDefaults } from './node_modules/helia/dist/src/utils/libp2p-defaults.browser.js'
// import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'

document.title = 'v2'

const log = (...args) => {
    console.log(...args)
    const logHtml = (...args) => {
        const p = document.createElement('p')
        let textContent = ''
        for (let [i, arg] of args.entries()) {
            if (textContent !== '') {
                textContent += ' '
            }
            if (typeof arg === 'object') {
                arg = {...arg}
                delete arg.publicKey
                arg.peer && delete arg.peer.peerRecordEnvelope
                delete arg.multihash
                textContent += JSON.stringify(arg, null, 2)
                if (args.length - 1 !== i) {
                    textContent += '\n'
                }
            }
            else {
                textContent += arg
            }
        }
        p.textContent = textContent
        p.style.whiteSpace = 'pre'
        document.body.prepend(p)
    }
    try {
        if (document.readyState !== 'complete') {
            window.addEventListener('load', () => logHtml(...args))
        }
        else {
            logHtml(...args)
        }
    }
    catch (e) {}
}

const logEvents = (nodeName, node) => {
    const events = [
        // 'connection:close',
        'connection:open',
        // 'connection:prune',
        // 'peer:connect',
        // 'peer:disconnect',
        // 'peer:discovery',
        // 'peer:identify',
        // 'peer:update',
        // 'self:peer:update',
        // 'start',
        // 'stop',
        // 'transport:close',
        // 'transport:listening',
    ]
    const logEvent = (event) => log(nodeName, event.type, event.detail)
    events.forEach(event => node.addEventListener(event, logEvent))
}

;(async () => {
try {

const bootstrapConfig = {
    list: [
        // "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
        // "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
        "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
        // "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
        // "/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
    ]
}

const createNode1 = async () => {
    // const node = await createLibp2p({
    //     peerDiscovery: [
    //         bootstrap(bootstrapConfig)
    //     ],
    //     transports: [
    //         webSockets(),
    //         webTransport(),
    //         webRTCDirect(),
    //         // circuitRelayTransport({discoverRelays: 1}) // TODO: test this later, probably need to upgrade libp2p, also test protocol autonat and protocol dcutr
    //     ],
    //     streamMuxers: [yamux(), mplex()],
    //     connectionEncryption: [noise()],
    //     connectionGater: {
    //         // not sure why needed, doesn't connect without it
    //         denyDialMultiaddr: async () => false,
    //     },
    //     services: {
    //         identify: identify(),
    //         dht: kadDHT({}),
    //         pubsub: gossipsub({allowPublishToZeroPeers: true})
    //     }
    // })
    // create libp2p options with pubsub and custom boostrap
    const libp2pOptions = libp2pDefaults()
    libp2pOptions.services.pubsub = gossipsub({allowPublishToZeroPeers: true})
    // delete libp2pOptions.services.delegatedRouting
    // libp2pOptions.peerDiscovery = [bootstrap(bootstrapConfig)]
    // not sure why needed, doesn't connect without it
    libp2pOptions.connectionGater = {denyDialMultiaddr: async () => false}

    const helia = await createHelia({libp2p: libp2pOptions})
    logEvents('node1', helia.libp2p)
    return helia.libp2p
}
const node1 = await createNode1()

// log addresses
log('node1', node1.getMultiaddrs())

const topic = 'demo'

// sub
node1.services.pubsub.addEventListener('message', (evt) => {
    log(`node1: ${evt.detail.from}: ${uint8ArrayToString(evt.detail.data)} on topic ${evt.detail.topic}`)
})
await node1.services.pubsub.subscribe(topic)

// pub
setInterval(() => {
  node1.services.pubsub.publish(topic, uint8ArrayFromString(`demo message from node 2 ${node1.peerId}`)).catch(err => {
    console.error(err)
  })
}, 1000)

} catch (e) {
    log(e.stack)
}
})()
