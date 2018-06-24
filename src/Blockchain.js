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
    // blocktime management
    this.difficultyUpdateInterval = 100
    this.
    this.difficulty = new BN(0)

    // blockchain layer
    this.blockheight = 0
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
  addBlock (header, transactions) {
    const blockHash = this.hashHeader(header)

    this.block_headers.push(header)
    this.block_hashes.push(blockHash)
    this.hash_to_index[blockHash] = this.blockheight
    this.last_block_hash = blockHash
    this.transactions.push(transactions)
    this.blockheight++

    this.updateDifficulty()
    this.updateState()
  }

  /**
   * @desc Verify a block, add it, and update state.
   * @param {Object} blockheader header of the block
   * @param {[Object]} transactions transaction list of the block
   * @returns Bool
   */
  verifyAddBlock (header, transactions) {
    if (this.verifyBlock(header, transactions)) {
      this._add_block(header, transactions)
      return true
    } else {
      return false
    }
  }

  /**
   * @desc Verify a block. It checks: (1) calculated minimum difficulty < header.difficulty < hash of the header (2) merkle hash of the transactions == header.treeHash (3) header.prevHash == last block hash
   * @param {Object} blockheader header of the block
   * @param {[Object]} transactions transaction list of the block
   * @returns Bool
   */
  verifyBlock (header, transactions) {
    let d = new BN(header.difficulty, 16)
    let h = new BN(this.hashHeader(header), 16)
    if (d.gt(this.difficulty) && h.gt(d)) {
      return false
    }
    if (this.merkleHash(transactions.map(this.hashTransaction)).getRoot() !== header.treeHash) {
      return false
    }
    if (header.prevHash !== this.last_block_hash) {
      return false
    }
    return true
  }

  // -----------------------------
  //   Difficulty Management
  // -----------------------------

  updateDifficulty () {
    if (this.blockheight % this.difficultyUpdateInterval === 0) {
      
    }
  }

  // -----------------------------
  //   Serialization And Hashing
  // -----------------------------

  serializeHeader (header) {
  }

  serializeTransaction (transaction) {

  }

  // --------------------------
  //   Transaction Processing
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
    const pendingBlock = {
      prevHash: this.last_block_hash,
      treeHash: new MerkleTree(txs.map(this.hashTransaction), sha256).getRoot(),
      nonce: '0'
    }
    this.miner.postMessage({header: pendingBlock, difficulty: this.difficulty})
    this.miner.onmessage = (e) => {
      pendingBlock.nonce = e.data
      if (!this.verifyAddBlock(pendingBlock, txs)) {
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
