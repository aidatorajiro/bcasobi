import BlockChain from './Blockchain.js'

/**
 * An blockchain for reactive programming transactions.
 * This system is inspired by Reflex, an haskell FRP framework.
 * @namespace Reactive
 */

export default class Reactive extends BlockChain {
  constructor () {
    super()
    this.events = {}

    this.reservedEvents = ['newblock']
    for (let id in this.reservedEvents) {
      this.events[id] = {
        dynToUpdate: []
      }
    }

    this.dyns = {}
  }

  updateState () {
    let transactions = this.transactions[this.transactions.length - 1]
    this.emitEvent('newblock')
    for (let i = 0; i < transactions.length; i++) {
      let tx = transactions[i]
      if (tx.func === 'createEvent' && !(tx.id in this.events)) {
        this.events[tx.id] = {
          dynToUpdate: []
        }
        continue
      }
      if (tx.func === 'emitEvent' && tx.id in this.events && !(tx.id in this.reservedEvents)) {
        this.emitEvent(tx.id, tx.data)
        continue
      }
      if (tx.func === 'holdDyn') {
        this.dyns[tx.dynId] = {
          event: tx.eventId,
          current: tx.init
        }
        this.events[tx.eventId].dynToUpdate.push(tx.dynId)
        continue
      }
    }
  }

  emitEvent (eventId, data) {
    for (let ev in this.events[eventId]) {
      this.dyns[ev.dynToUpdate] = data
    }
  }
}
