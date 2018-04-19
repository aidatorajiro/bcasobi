const difficulty = '6666';

/**
 * Class reprensenting a BlockChain
 * @namespace BlockChain
 */
class BlockChain {
  /**
   * @desc Create a blockchain.
   * @param {[Object]} genesisTxs - The list of genesis transactions.
   * @param {Function} onblockadded - The event handler called on block added.
   * @param {Function} generatecoinbasetx - Generates the first transaction on mining.
   */
  constructor (genesisTxs, onblockadded, generatecoinbasetx) {
    // transaction layer
    this.onblockadded = onblockadded;

    // block layer
    this.block_headers = [];
    this.block_hashes = [];
    this.hash_to_index = {};
    this.last_block_hash = null;
    this.transactions = [];

    this._add_block({
      prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
      treeHash: new MerkleTree(genesisTxs.map(hashobj), sha256).getRoot(),
      nonce: '0'
    }, genesisTxs);

    // mining layer
    this.generatecoinbasetx = generatecoinbasetx;
    this.pending_transactions = [];
    this.miner = undefined;
  }

  // ----------------------
  //    Block Management
  // ----------------------

  _add_block (blockheader, transactions) {
    const txhashes = transactions.map(hashobj);
    const blockHash = hashobj(blockheader);

    this.block_headers.push(blockheader);
    this.block_hashes.push(blockHash);
    this.hash_to_index[blockHash] = this.block_headers.length - 1;
    this.last_block_hash = blockHash;
    this.transactions.push(transactions);

    this.onblockadded.call(this, blockheader, transactions);
  }

  verifyAddBlock (blockheader, transactions) {
    if (this.verifyBlock(blockheader, transactions)) {
      this._add_block(blockheader, transactions);
      return true;
    } else {
      return false;
    }
  }

  verifyBlock (blockheader, transactions) {
    if (!hashobj(blockheader).startsWith(difficulty)) {
      return false;
    }
    if (new MerkleTree(transactions.map(hashobj), sha256).getRoot() !== blockheader.treeHash) {
      return false;
    }
    if (blockheader.prevHash !== this.last_block_hash) {
      return false;
    }
    return true;
  }

  // ----------------------
  //         Mining
  // ----------------------

  /**
   * @desc Launch a mining program. If already exists, terminate old one and restart.
   * @private
   */
  _restart_miner() {
    if (this.miner !== undefined) {
      this.miner.terminate();
    }
    this.miner = new Worker('miner.js');
    const coinbasetx = this.generatecoinbasetx.call(this);
    const txs = [coinbasetx].concat(this.pending_transactions);
    const pending_block = {
      prevHash: this.last_block_hash,
      treeHash: new MerkleTree(txs.map(hashobj), sha256).getRoot(),
      nonce: '0'
    };
    this.miner.postMessage({blockheader: pending_block, difficulty: difficulty});
    this.miner.onmessage = (e) => {
      pending_block.nonce = e.data;
      if (!this.verifyAddBlock(pending_block, txs)) {
        throw new Error('something wrong with the miner');
      }
      this.pending_transactions = [];
      this._restart_miner();
    };
  }

  /**
   * @desc Start mining.
   */
  startMining () {
    if (this.miner !== undefined) {
      throw new Error('miner already started');
    }
    this._restart_miner();
  }

  /**
   * @desc Stop mining.
   */
  stopMining () {
    if (this.miner === undefined) {
      throw new Error('miner already stopped');
    }
    this.miner.terminate();
    this.miner = undefined;
  }

  /**
   * @desc Add a pending transaction.
   * @param {Object} tx - A transaction object.
   */
  addPendingTransaction (tx) {
    if (this.miner === undefined) {
      throw new Error('miner is not running');
    }
    this.pending_transactions.push(tx);
    this._restart_miner();
  }

  // -----------------------
  //     Peer Connection    
  // -----------------------
  startPeerConnection () {
  }
}