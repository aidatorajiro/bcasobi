import BN from 'bn.js'

/**
 * Class reprensenting a BlockChain
 * @namespace BlockChain
 */
export default class BlockChain {
  /**
   * @desc Create a blockchain.
   */
  constructor () {
    // block layer
    this.block_headers = []
    this.block_hashes = []
    this.hash_to_index = {}
    this.last_block_hash = null
    this.transactions = []

    // tx layer
    this.state = undefined

    // mining layer
    this.pending_transactions = []
    this.miner = undefined
  }

  // ----------------------
  //    Block Management
  // ----------------------

  /**
   * @desc Add a block and update state.
   * @param {Object} blockheader header of the block
   * @param {[Object]} transactions transaction list of the block
   */
  addBlock (blockheader, transactions) {
    const blockHash = this.hashBlockHeader(blockheader)

    this.block_headers.push(blockheader)
    this.block_hashes.push(blockHash)
    this.hash_to_index[blockHash] = this.block_headers.length - 1
    this.last_block_hash = blockHash
    this.transactions.push(transactions)

    this.updateState()
  }

  /**
   * @desc Verify a block, add it, and update state.
   * @param {Object} blockheader header of the block
   * @param {[Object]} transactions transaction list of the block
   * @returns Bool
   */
  verifyAddBlock (blockheader, transactions) {
    if (this.verifyBlock(blockheader, transactions)) {
      this._add_block(blockheader, transactions)
      return true
    } else {
      return false
    }
  }

  verifyBlock (blockheader, transactions) {
    let d = new BN(blockheader.difficulty, 16)
    let h = new BN(this.hashBlockHeader(blockheader), 16)
    if (h.gt(d)) {
      return false
    }
    if (this.merkleHash(transactions.map(this.hashTransaction)).getRoot() !== blockheader.treeHash) {
      return false
    }
    if (blockheader.prevHash !== this.last_block_hash) {
      return false
    }
    return true
  }

  // --------------------------
  //   Transaction Magagement
  // --------------------------

  /**
   * @desc The callback function for updating state. Only called on adding blocks.
   */
  updateState () {
  }

  // ----------------------
  //         Mining
  // ----------------------

  /**
   * @desc Launch a mining program. If already exists, terminate old one and restart.
   * @private
   */
  restartMiner () {
    if (this.miner !== undefined) {
      this.miner.terminate()
    }
    this.miner = new Worker('miner.js')
    const coinbasetx = this.generatecoinbasetx.call(this)
    const txs = [coinbasetx].concat(this.pending_transactions)
    const pending_block = {
      prevHash: this.last_block_hash,
      treeHash: new MerkleTree(txs.map(this.hashTransaction), sha256).getRoot(),
      nonce: '0'
    }
    this.miner.postMessage({blockheader: pending_block, difficulty: difficulty})
    this.miner.onmessage = (e) => {
      pending_block.nonce = e.data
      if (!this.verifyAddBlock(pending_block, txs)) {
        throw new Error('something wrong with the miner')
      }
      this.pending_transactions = []
      this._restart_miner()
    }
  }

  /**
   * @desc Start mining.
   */
  startMining () {
    if (this.miner !== undefined) {
      throw new Error('miner already started')
    }
    this._restart_miner()
  }

  /**
   * @desc Stop mining.
   */
  stopMining () {
    if (this.miner === undefined) {
      throw new Error('miner already stopped')
    }
    this.miner.terminate()
    this.miner = undefined
  }

  /**
   * @desc Add a pending transaction.
   * @param {Object} tx - A transaction object.
   */
  addPendingTransaction (tx) {
    if (this.miner === undefined) {
      throw new Error('miner is not running')
    }
    this.pending_transactions.push(tx)
    this._restart_miner()
  }

  // -----------------------
  //     Peer Connection
  // -----------------------
  startPeerConnection () {
  }
}
