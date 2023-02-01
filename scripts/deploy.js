
const TokenStaking = artifacts.require("TokenStaking");

module.exports = async function(callback){

  let tokenStaking = await TokenStaking.deployed();
  await tokenStaking.issueTokens()

    console.log("Token issued!")

    callback()
  };
