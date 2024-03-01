# demo5: peer discovery between 2 browsers using webrtc direct and go webtransport as signaling server

```
./demo5.sh
```
- open `demo5.html` in chrome (no webtransport in firefox/safari yet) and add `?<multiaddress>` to the URL, e.g. `demo2.html?/ip4/127.0.0.1/udp/56916/quic-v1/webtransport/certhash/uEiBA6BEvjGlHJb7ZhLKazj6VFl03pX7kbDN4SU2gFM5yuw/certhash/uEiCeZhADwPPyWJe4Ert9nlpXyDv9RF4b_0DdCIqHAQdvQQ/p2p/12D3KooWDpJ7As7BWAwRMfu1VU2WCqNjvq387JEYKDBj4kx6nXTN`
> NOTE: can debug libp2p connection issues in the browser by doing `localStorage.debug = 'libp2p:*'`

