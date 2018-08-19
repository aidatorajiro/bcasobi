import JSSHA from 'jssha'

export default class Util {
  static sha256 (text) {
    var shaObj = new JSSHA('SHA-256', 'TEXT')
    shaObj.update(text)
    return shaObj.getHash('HEX')
  }
}
