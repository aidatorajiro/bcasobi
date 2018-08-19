import BlockChain from './Blockchain.js'

export default class Combinatory extends BlockChain {
  constructor () {
    super()
    this.state = {}
  }
  updateState () {
    let transactions = this.transactions[this.transactions.length - 1]
    for (let i = 0; i < transactions.length; i++) {
      let tx = transactions[i]
      
    }
  }
  checkType () {
  }
}
