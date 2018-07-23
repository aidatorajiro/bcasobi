/* global Worker */

import BigNumber from 'bignumber.js'

/**
 * Class reprensenting a BlockChain
 * @namespace BlockChain
 * @typedef {Object} Transaction
 * @typedef {Object} BlockHeader
 */
export default class BlockChain {
  /**
   * Create a blockchain.
   */
  constructor () {
    // blocktime management

    /**
     * The number of blocks to update target.
     * @type {number}
     */
    this.targetUpdateInterval = 100

    /**
     * The blocktime in seconds.
     * @type {number}
     */
    this.blockTime = 1000

    /**
     * The block timestamp tolerance in seconds.
     * @type {number}
     */
    this.timestampTolerance = 900

    /**
     * The current minimum target requirement for a block.
     * @type {BigNumber}
     */
    this.target = new BigNumber('115792089237316195423570985008687907853269984665640564039457584007913129639936')

    // blockchain data

    /**
     * The block height. Equals to this.block_headers.length.
     * @type {number}
     */
    this.blockheight = 0

    /**
     * The list of block headers in chronological order.
     * @type {BlockHeader[]}
     */
    this.block_headers = []

    /**
     * The list of block hashes in chronological order.
     * @type {string[]}
     */
    this.block_hashes = []

    /**
     * The hash table which maps a block hash to a block index.
     * @type {Object.<string, number>}
     */
    this.hash_to_index = {}

    /**
     * The last block hash. Same as `this.block_hashes[this.blockheight - 1]`.
     * @type {string}
     */
    this.last_block_hash = undefined

    /**
     * The matrix of transactions. `this.transactions[i][j]` represents the j-th transaction of i-th block.
     * @type {Transaction[][]}
     */
    this.transactions = []

    // tx layer

    /**
     * The state of blockchain.
     * In default, this is `undefined` and will never be changed.
     * You can specify the behavior to change this by overriding `this.updateState`.
     * @type {Object}
     */
    this.state = {}

    // mining layer

    /**
     * The transactions which are waiting to be mined.
     * @type {Transaction[]}
     */
    this.pending_transactions = []

    /**
     * The web worker for mining.
     * @type {Worker}
     */
    this.miner = undefined
  }

  // ----------------------
  //    Block Management
  // ----------------------

  /**
   * Add a block and update state.
   * @param {BlockHeader} header header of the block
   * @param {Transaction[]} transactions transactions of the block
   */
  addBlock (header, transactions) {
    const blockHash = this.hashHeader(header)

    this.block_headers.push(header)
    this.block_hashes.push(blockHash)
    this.hash_to_index[blockHash] = this.blockheight
    this.last_block_hash = blockHash
    this.transactions.push(transactions)
    this.blockheight++

    this.updateTarget()
    this.updateState()
  }

  /**
   * Verify a block, add it, and update state.
   * @param {BlockHeader} header header of the block
   * @param {Transaction[]} transactions transaction list of the block
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
   * Verify a block. It checks:
   * 1. calculated minimum target < hash of the header < header.target
   * 2. header.treeHash == merkle hash of the transactions
   * 3. header.prevHash == last block hash
   * 4. last timestamp < header.timestamp < timestamp tolerance + current unix time
   * @param {BlockHeader} header header of the block
   * @param {Transaction[]} transactions transaction list of the block
   * @returns Bool
   */
  verifyBlock (header, transactions) {
    let hashAsNumber = new BigNumber(this.hashHeader(header), 16)
    let blockTarget = new BigNumber(header.target, 16)
    if (!(hashAsNumber.gt(this.target) && blockTarget.gt(hashAsNumber))) {
      return false
    }
    if (!(this.hashTransactions(transactions) === header.treeHash)) {
      return false
    }
    if (!(header.prevHash === this.last_block_hash)) {
      return false
    }
    let lastTimestamp = this.block_headers[this.blockheight - 1].timestamp
    let maxTimestamp = new Date().getTime() + this.timestampTolerance
    if (!(lastTimestamp < header.timestamp && header.timestamp < maxTimestamp)) {
      return false
    }
    return true
  }

  // -----------------------------
  //     Blocktime Management
  // -----------------------------

  updateTarget () {
    if (this.blockheight % this.targetUpdateInterval === 0) {
      let diff = this.block_headers[this.blockheight - 1].blockTime - this.block_headers[this.blockheight - this.targetUpdateInterval].blockTime
      this.target = this.target.div(this.blockTime / diff / this.targetUpdateInterval).integerValue()
    }
  }

  // -----------------------------
  //   Serialization And Hashing
  // -----------------------------

  serializeHeader (header) {
  }

  serializeTransaction (transaction) {
  }

  hashTransactions (txs) {
  }

  hashTransaction (tx) {
  }

  hashString (string) {
  }

  // --------------------------
  //   Transaction Processing
  // --------------------------

  /**
   * The callback function for updating state. Only called on adding blocks.
   */
  updateState () {
  }

  // ----------------------
  //         Mining
  // ----------------------

  /**
   * Launch a mining program. If already exists, terminate old one and restart.
   */
  restartMiner () {
    if (this.miner !== undefined) {
      this.miner.terminate()
    }
    this.miner = new Worker('workers/miner.js')
    const coinbasetx = this.generateCoinbaseTx()
    const txs = [coinbasetx].concat(this.pending_transactions)
    const pendingBlock = {
      prevHash: this.last_block_hash,
      treeHash: this.hashTransactions(txs),
      nonce: undefined
    }
    this.miner.postMessage({header: pendingBlock, target: this.target})
    this.miner.onmessage = (e) => {
      pendingBlock.nonce = e.data
      if (!this.verifyAddBlock(pendingBlock, txs)) {
        throw new Error('something wrong with the miner')
      }
      this.pending_transactions = []
      this.restartMiner()
    }
  }

  /**
   * Start mining.
   */
  startMining () {
    if (this.miner !== undefined) {
      throw new Error('miner already started')
    }
    this.restartMiner()
  }

  /**
   * Stop mining.
   */
  stopMining () {
    if (this.miner === undefined) {
      throw new Error('miner already stopped')
    }
    this.miner.terminate()
    this.miner = undefined
  }

  /**
   * Add a pending transaction.
   * @param {Transaction} tx A transaction object.
   */
  addPendingTransaction (tx) {
    if (this.miner === undefined) {
      throw new Error('miner is not running')
    }
    this.pending_transactions.push(tx)
    this.restartMiner()
  }

  // -----------------------
  //     Peer Connection
  // -----------------------
  /**
   * Calculate total difficulty.
   * @param {BlockHeader[]} blockheaders
   * @returns {BigNumber} totalDifficulty
   */
  calculateTotalDifficulty () {
    
  }

  /**
   * Start peer connections. The protocl is as following:
   * 1. 
   */
  startPeerConnection () {
  }
}
