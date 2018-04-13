importScripts('sha.js');
importScripts('Util.js');

onmessage = function(e) {
  const blockheader = e.data.blockheader;
  const difficulty = e.data.difficulty;
  for (let nonce = 0;;nonce++) {
    blockheader.nonce = String(nonce);
    if (hashobj(blockheader).startsWith(difficulty)) {
      break;
    }
  }
  postMessage(blockheader.nonce);
}