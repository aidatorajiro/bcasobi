import BlockChain from 'Blockchain.js'
import { ec as EC } from 'elliptic'

let ec = new EC('secp256k1')

/**
 * An account-base blockchain.
 * @namespace AccountBase
 */
export default class AccountBase extends BlockChain {
  updateState () {
    let transactions = this.transactions[this.transactions.length - 1]
    for (let i = 0; i < transactions.length; i++) {
      let tx = transactions[i]
      // Give mining rewards to the miner
      if (i === 0) {
        this.state[tx.to].add('1000000000')
        continue
      }
      // Virify the signature
      const massagehash = this.hashTransaction(tx)
      const pub = ec.recoverPubKey(massagehash, tx.signature, tx.recoveryParam, 'hex')
      if (tx.from === this.hashString(pub.encode('hex')) && tx.amount <= this.state(tx.from)) {
        this.state[tx.from].sub(tx.amount)
        this.state[tx.to].add(tx.amount)
      }
    }
  }
}
