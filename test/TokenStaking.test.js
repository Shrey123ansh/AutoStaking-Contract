const { assert, use } = require("chai");
const { default: Web3 } = require("web3");

const TestToken = artifacts.require("TestToken");
const TokenStaking = artifacts.require("TokenStaking");

require("chai").use(require("chai-as-promised")).should();

//helper function to convert tokens to ether
function tokenCorvert(n) {
  return web3.utils.toWei(n, "ether");
}

contract("TokenStaking", ([owner, investor]) => {
  let testToken, tokenStaking;

  before(async () => {
    //Load contracts
    testToken = await TestToken.new();
    tokenStaking = await TokenStaking.new(testToken.address);

    //transfer 500k to TokenStaking
    await testToken.transfer(tokenStaking.address, tokenCorvert("500000"));

    //sending some test tokens to investor at address[1] { explaining where it comes from}
    await testToken.transfer(investor, tokenCorvert("10000"), {
      from: owner,
    });
  });

  // Test 1
  // 1.1 Checking if Token contract has a same name as expected
  describe("TestToken deployment", async () => {
    it("token deployed and has a name", async () => {
      const name = await testToken.name();
      assert.equal(name, "TestToken");
    });
  });

  // Test 2
  // 2.1 Checking if TokenStaking contract has a same name as expected
  describe("TokenStaking deployment", async () => {
    it("staking contract deployed and has a name", async () => {
      const name = await tokenStaking.name();
      assert.equal(name, "Yield Farming / Token dApp");
    });

    //2.2 checking  apy value
    it("checking  APY value", async () => {
      const value = await tokenStaking.APY();
      assert.equal(value, "137");
    });

    // 2.3 Checking if TokenStaking contract has 500k of TestTokens
    it("staking contract has 500k TestTokens tokens inside", async () => {
      let balance = await testToken.balanceOf(tokenStaking.address);
      assert.equal(balance.toString(), tokenCorvert("500000"));
    });
  });

  // Test 3
  // 3.1 Testing stakeTokens function
  describe("TokenStaking stakeTokens function", async () => {
    let result;
    it("investors balance is correct before staking", async () => {
      result = await testToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokenCorvert("10000"),
        "investors balance is correct before staking"
      );
    });

    // 3.2 checking TokenStaking total banalce
    it("checking total staked before any stakes", async () => {
      result = await tokenStaking.totalStaked();
      assert.equal(
        result.toString(),
        tokenCorvert("0"),
        "total staked should be 0"
      );
    });

    // 3.3 Testing stakeTokens function
    it("approving tokens, staking tokens, checking balance", async () => {
      // first approve tokens to be staked
      await testToken.approve(tokenStaking.address, tokenCorvert("1000"), {
        from: investor,
      });
      // stake tokens
      await tokenStaking.stakeTokens(tokenCorvert("1000"), { from: investor });

      // check balance of investor if they have 0 after staking
      result = await testToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokenCorvert("9000"),
        "investor balance after staking 9000"
      );
    });

    // 3.4 checking balance of TokenStaking contract should be 500k +10000
    it("checking contract balance after staking", async () => {
      result = await testToken.balanceOf(tokenStaking.address);
      assert.equal(
        result.toString(),
        tokenCorvert("501000"),
        "Smart contract total balance after staking 1000"
      );
    });

    // 3.5 checking TokenStaking contract investors balance
    it("checking investor balance inside contract", async () => {
      result = await tokenStaking.stakingBalance(investor);
      assert.equal(
        result.toString(),
        tokenCorvert("1000"),
        "Smart contract balance for investor"
      );
    });

    // 3.6 checking TokenStaking totalstaked balance
    it("checking total staked", async () => {
      result = await tokenStaking.totalStaked();
      assert.equal(
        result.toString(),
        tokenCorvert("1000"),
        "total staked should be 1000"
      );
    });

    // 3.7 checking isStaking function to see if investor is staking
    it("testing if investor is staking at the moment", async () => {
      result = await tokenStaking.isStakingAtm(investor);
      assert.equal(result.toString(), "true", "investor is currently staking");
    });

    // 3.8 checking hasStaked function to see if investor ever staked
    it("testing if investor has staked", async () => {
      result = await tokenStaking.hasStaked(investor);
      assert.equal(result.toString(), "true", "investor has staked");
    });
  });

  // Test 4
  describe("TokenStaking redistributeRewards function", async () => {
    let result;
    // 4.1 checking who can issue tokens
    it("checking who can do redistribution", async () => {
      //issue tokens function from owner
      await tokenStaking.Rewards({ from: owner });

      //issue tokens function from investor, should not be able
      await tokenStaking.Rewards({ from: investor }).should.be.rejected;
    });

    // 4.2 checking balance of TokenStaking contract after redistribution
    it("checking TokenStaking balance", async () => {
      result = await testToken.balanceOf(tokenStaking.address);
      assert.equal(
        result.toString(),
        tokenCorvert("501000"),
        "Smart contract total balance after staking 1000"
      );
    });

    // 4.3 check balance of investor after redistribution should be X / 1000
    it("checking investor balance", async () => {
      result = await testToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokenCorvert("9000"),
        "investor total balance after redistribution 9000"
      );
    });
  });

  // Test 5
  describe("TokenStaking unstakeTokens function", async () => {
    let result;
    // 5.1 Testing unstaking function
    it("unstaking and checking investors balance after unstake", async () => {
      await tokenStaking.unstakeTokens({ from: investor });
      result = await testToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokenCorvert("10001"),
        "investor balance after unstaking 9000+1001"
      );
    });

    // 5.2 checking TokenStaking total staked balance
    it("checking total staked", async () => {
      result = await tokenStaking.totalStaked();
      assert.equal(
        result.toString(),
        tokenCorvert("0"),
        "total staked should be 0"
      );
    });
  });

  // Test 6
  describe("TokenStaking [] staking/unstaking functions", async () => {
    let result;
    // 6.1 checking TokenStaking total  staking banalce
    it("checking total  staked before any stakes", async () => {
      result = await tokenStaking.TotalStaked();
      assert.equal(
        result.toString(),
        tokenCorvert("0"),
        "total staked should be 0"
      );
    });

    // 6.2 checking investors Balance before staking
    it("checking investors balance before staking", async () => {
      result = await testToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokenCorvert("10001"),
        "investor balance after staking 10001"
      );
    });

    // 6.3 testing if investor able to stake in  staking
    it("approving tokens, staking tokens, checking balance", async () => {
      // first approve tokens to be staked
      await testToken.approve(tokenStaking.address, tokenCorvert("9000"), {
        from: investor,
      });
      // stake tokens
      await tokenStaking.Staking(tokenCorvert("9000"), { from: investor });

      // check balance of investor if they have 1000 after staking
      result = await testToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokenCorvert("1001"),
        "investor balance after staking 1001"
      );
    });

    // 6.4 check  total staking balance
    it("checking  total staked", async () => {
      result = await tokenStaking.TotalStaked();
      assert.equal(
        result.toString(),
        tokenCorvert("9000"),
        "total staked should be 9000"
      );
    });

    // 6.5 checking IsStakingAtm function to see if investor is staking
    it("testing if investor is staking at  staking at the moment", async () => {
      result = await tokenStaking.IsStakingAtm(investor);
      assert.equal(result.toString(), "true", "investor is currently staking");
    });

    // 6.6 checking HasStaked function to see if investor ever staked
    it("testing if investor has staked at  staking", async () => {
      result = await tokenStaking.HasStaked(investor);
      assert.equal(result.toString(), "true", "investor has staked");
    });

    // 6.7 unstaking from  staking and checking balance
    it("unstaking from  staking and checking investors balance ", async () => {
      await tokenStaking.Unstake({ from: investor });
      result = await testToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokenCorvert("10011"),
        "investor balance after unstaking 1001 + 9010"
      );
    });
  });

  // Test 7
  describe("Claim Tst", async () => {
    let result;
    // 7.1 testing claim test token function
    it("trying to obtain 1000 test token", async () => {
      await tokenStaking.claimTst({ from: investor });

      result = await testToken.balanceOf(investor);
      assert.equal(result.toString(), tokenCorvert("11011"), "10011 + 1000");
    });
  });

  // Test 8
  describe("Change  APY value", async () => {
    let result;

    // 8.1 testing who can change  APY
    it("checking who can change APY", async () => {
      await tokenStaking.changeAPY("200", { from: owner });
      // testing with invalid arguments
      await tokenStaking.changeAPY({ from: owner }).should.be.rejected;
      await tokenStaking.changeAPY(tokenCorvert("0"), { from: owner }).should.be
        .rejected;
      await tokenStaking.changeAPY(tokenCorvert("200"), { from: investor })
        .should.be.rejected;
    });

    // 8.2 checking New  APY value
    it("checking new  APY value", async () => {
      const value = await tokenStaking.APY();
      assert.equal(value, "200", " APY set to 200 (0.2% Daily)");
    });
  });

  // Test 9
  describe("Testing  APY reward redistribution", async () => {
    let result;
    // 9.1 redistributing  APY rewards
    it("staking at Staking", async () => {
      await testToken.approve(tokenStaking.address, tokenCorvert("1000"), {
        from: investor
      });
      // stake tokens
      await tokenStaking.Staking(tokenCorvert("1000"), { from: investor });
      // checking investor balance after staking
      result = await testToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokenCorvert("10011"),
        "investor balance after unstaking 11011 - 1000"
      );
    });
    // 9.2 issuing  rewards
    it("rewards, checking who can redistribute", async () => {
      // issue Rewards function from owner
      await tokenStaking.Rewards({ from: owner });

      // issue Rewards function from investor, should not be able
      await tokenStaking.Rewards({ from: investor }).should.be.rejected;
    });
    // 9.2 checking new investor balance after  rewards
    it("checking investor balance after  APY rewards ", async () => {
      result = await testToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokenCorvert("10011"),
        "investor balance after unstaking 10011"
      );
    });
  });
});

