'use strict';

var bitcore = require('@monaco-ex/bitcore-lib');
var _ = bitcore.deps._;
var Message = require('@monaco-ex/bitcore-message');
var Common = require('./common');

var coininfo = require('@monaco-ex/coininfo');
var Networks = bitcore.Networks
Networks.remove(Networks.testnet);
Networks.mainnet = Networks.add(coininfo.monacoin.main.toBitcore());
Networks.testnet = Networks.add(coininfo.monacoin.test.toBitcore());
Networks.livenet = Networks.mainnet;
Message.MAGIC_BYTES = new Buffer('Monacoin Signed Message:\n');

function MessagesController(node) {
  this.node = node;
  this.common = new Common({log: this.node.log});
}

MessagesController.prototype.verify = function(req, res) {
  var self = this;
  var address = req.body.address || req.query.address;
  var signature = req.body.signature || req.query.signature;
  var message = req.body.message || req.query.message;
  if(_.isUndefined(address) || _.isUndefined(signature) || _.isUndefined(message)) {
    return self.common.handleErrors({
      message: 'Missing parameters (expected "address", "signature" and "message")',
      code: 1
    }, res);
  }
  var valid;
  try {
    valid = new Message(message).verify(address, signature);
  } catch(err) {
    return self.common.handleErrors({
      message: 'Unexpected error: ' + err.message,
      code: 1
    }, res);
  }
  res.json({'result': valid});
};

module.exports = MessagesController;
