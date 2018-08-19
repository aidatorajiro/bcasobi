export default class Peer {
  constructor () {
    this.connected = []
  }
  broadcast (data) {
    for (let i of this.connected) {
      i.send(data)
    }
  }
  addPeer () {

  }
}
