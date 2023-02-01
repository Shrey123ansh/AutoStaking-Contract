const TokenStaking = artifacts.require('TokenStaking');

module.exports = async function(callback) {
  if (process.argv[4] === 'custom') {
    let tokenStaking = await TokenStaking.deployed();
    await tokenStaking.Rewards();
    console.log('--- Daily [custom] rewards have been redistributed ---');
    callback();
  } else if (!process.argv[4]) {
    let tokenStaking = await TokenStaking.deployed();
    await tokenStaking.Rewards();
    console.log('--- Daily rewards have been redistributed ---');
    callback();
  } else {
    console.log(
      'Error: Invalid argument provided, for custom reward redistribution use: truffle exec scripts/redistribute.js custom'
    );
  }
};