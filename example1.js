const ChainStorage = require('SugoiYabaiFramework/ChainStorage');
const TransactionProcessor = require('SugoiYabaiFramework/TransactionProcessor');
const BlockChain = require('SugoiYabaiFramework/BlockChain');

initialParams = {
  balances: {}
}

processFunc = function (txindex, params) {
  const tx = this.txs[txindex]
  if (txindex === 0) {
    if (balances[tx.to] === undefined) {
      balances[tx.to] = 0;
    }
    params.balances[tx.to] += 1000000;
    return true;
  }
  const account = sigToAccount(tx.signature);
  if (tx.from !== account) {
    return false;
  } else if (balances[tx.from] === undefined) {
    return false;
  } else if (balances[tx.from] < tx.amount) {
    return false;
  } else {
    if (balances[tx.to] === undefined) {
      balances[tx.to] = 0;
    }
    balances[tx.to] += tx.amount;
  }
}