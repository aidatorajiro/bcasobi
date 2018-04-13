function sign(priv, message) {
  const ec = elliptic.ec('secp256k1');
  const key = ec.keyFromPrivate(priv);
  return key.sign(message).toDER('hex');
}

function createKeyPair() {
  const ec = elliptic.ec('secp256k1');
  const key = ec.genKeyPair();
  const priv = key.getPrivate().toString('hex');
  const pub  = '04' + key.getPublic().getX().toString('hex') + key.getPublic().getY().toString('hex');
  return [priv, pub];
}

function require (bool, msg) {
  if (!bool) {
    throw new Error(msg);
  }
}

function hashobj (tx) {
  return sha256(JSON.stringify(tx));
}