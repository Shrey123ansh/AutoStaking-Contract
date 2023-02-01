// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./TestToken.sol";

contract TokenStaking {
    string public name = "Yield Farming / Token dApp";
    TestToken public testToken;

    //declaring owner state variable
    address public owner;

    //declaring APY for  staking ( default 0.137% daily or 50% APY yearly)
    uint256 public APY = 137;

    //declaring total staked
    uint256 public TotalStaked;

    //users staking balance
    mapping(address => uint256) public StakingBalance;

    //mapping list of users who ever staked
    mapping(address => bool) public HasStaked;

    //mapping list of users who are staking at the moment
    mapping(address => bool) public IsStakingAtm;

    //array of all stakers
    address[] public Stakers;

    constructor(TestToken _testToken) public payable {
        testToken = _testToken;

        //assigning owner on deployment
        owner = msg.sender;
    }


    // different APY Pool
    function Staking(uint256 _amount) public {
        require(_amount > 0, "amount cannot be 0");
        testToken.transferFrom(msg.sender, address(this), _amount);
        TotalStaked = TotalStaked + _amount;
        StakingBalance[msg.sender] =
            StakingBalance[msg.sender] +
            _amount;

        if (!HasStaked[msg.sender]) {
            Stakers.push(msg.sender);
        }
        HasStaked[msg.sender] = true;
        IsStakingAtm[msg.sender] = true;
    }

    function Unstake() public {
        uint256 balance = StakingBalance[msg.sender];
        require(balance > 0, "amount has to be more than 0");
        testToken.transfer(msg.sender, balance);
        TotalStaked = TotalStaked - balance;
        StakingBalance[msg.sender] = 0;
        IsStakingAtm[msg.sender] = false;
    }


    //APY airdrop
    function Rewards() public {
        require(msg.sender == owner, "Only contract creator can redistribute");
        for (uint256 i = 0; i < Stakers.length; i++) {
            address recipient = Stakers[i];
            uint256 balance = StakingBalance[recipient] * APY;
            balance = balance / 100000;

            if (balance > 0) {
                StakingBalance[msg.sender] = StakingBalance[msg.sender] + balance;
            }
        }
    }

    //change APY value for staking
    function changeAPY(uint256 _value) public {
        //only owner can issue airdrop
        require(msg.sender == owner, "Only contract creator can change APY");
        require(
            _value > 0,
            "APY value has to be more than 0, try 100 for (0.100% daily) instead"
        );
        APY = _value;
    }

    //cliam test 1000 Tst (for testing purpose only !!)
    function claimTst() public {
        address recipient = msg.sender;
        uint256 tst = 1000000000000000000000;
        uint256 balance = tst;
        testToken.transfer(recipient, balance);
    }
}
