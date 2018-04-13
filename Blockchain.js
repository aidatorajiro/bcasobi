const difficulty = '6666';
const prize = '1000000000000';

const genesisPrivateKey = '11885baf58a8002c504d364ca5c0428e4b914d783de68d3828743580f006f762';
const genesisPublicKey = '04ee380af9823303cc1a653c16ebe29aa6666552f649eea1136a50bed3000dc52d87f9b24e9c57fbf9d7ac34ff7eb8dbed0301fbea81dea63dcd6bf760adf13e35';
const genesisTransactions = [{
  ins: [],
  outs: [{address: sha256(genesisPublicKey), amount: prize}]
}];
const genesisBlockHeader = {
  prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
  treeHash: new MerkleTree(genesisTransactions.map(hashobj), sha256).getRoot(),
  nonce: '0'
};

/**
 * Class reprensenting a BlockChain
 * @namespace BlockChain
 */
class BlockChain {
  constructor () {
    // for block management section
    this.block_headers = [];
    this.block_hashes = [];
    this.hash_to_index = {};
    this.last_block_hash = null;

    this.transactions = [];

    this._add_block(genesisBlockHeader, genesisTransactions);

    // for mining section
    this.coinbase = sha256(genesisPublicKey);
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
  _start_miner() {
    if (this.worker !== undefined) {
      this.miner.terminate();
    }
    this.miner = new Worker('miner.js');
    const coinbasetx = {
      ins: [],
      outs: [{address: this.coinbase, amount: prize}]
    };
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
      this._start_miner();
    };
  }

  addPendingTransaction (tx) {
    this.pending_transactions.push(tx);
  }

  removeAllPendingTransaction () {
    this.pending_transactions = [];
  }
}