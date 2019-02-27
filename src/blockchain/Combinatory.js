import BlockChain from './Blockchain.js'
import JSSHA from 'jssha'

export default class Combinatory extends BlockChain {
  constructor () {
    super()
    this.hashToPath = {}
    
    addNode([])
  }
  updateState () {
    let transactions = this.transactions[this.transactions.length - 1]
    for (let i = 0; i < transactions.length; i++) {
      let tx = transactions[i]
      addNode(this.hashToPath[tx.hash].concat(tx.func))
    }
  }
  addNode (arr) {
    let shaObj = new JSSHA('SHA-256', 'BYTES')
    shaObj.update(arr)
    let hash = shaObj.getHash('HEX')
    this.hashToPath[hash] = arr
  }
}
