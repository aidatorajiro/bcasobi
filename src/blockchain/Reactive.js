import BlockChain from 'Blockchain.js'

/**
 * An blockchain for reactive programming transactions.
 * This system is inspired by Reflex, an haskell FRP framework.
 *
 * There are three main transaction types:
 * 1. Event - This type of transaction will create an Event, .
 * 2. Behavior - This type of transaction will create a Behavior, ... This is the cheapest transaction type, because nodes will only hold Behaviors' latest state.
 * 3. Dynamic - This type of transaction will create a Dynamic, .
 *
 * @namespace Reactive
 */

export default class Reactive extends BlockChain {
  updateState () {
    let transactions = this.transactions[this.transactions.length - 1]
    for (let i = 0; i < transactions.length; i++) {
      let tx = transactions[i]
    }
  }
}
