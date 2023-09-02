import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";

const DisplayContractTests = () => {
  const codeContractTests = `
  import { expect } from "chai";
  import { ethers } from "hardhat";
  import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
  import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
  import { Auction } from "../typechain-types";
  import { parseEther } from "ethers";
  
  // MAIN DESCRIBE BLOCK
  describe("Auction", async () => {
    let auctionContract_: Auction;
    let deployer: HardhatEthersSigner;
    let acct1: HardhatEthersSigner;
    let acct2: HardhatEthersSigner;
  
    // FIXTURE
    async function deployContract() {
      const auctionFactory = await ethers.getContractFactory("Auction");
      const auctionContract = await auctionFactory.deploy();
      await auctionContract.waitForDeployment();
      return { auctionContract };
    }
  
    // BEFORE EACH
    beforeEach(async () => {
      [deployer, acct1, acct2] = await ethers.getSigners();
  
      const { auctionContract } = await loadFixture(deployContract);
  
      auctionContract_ = auctionContract;
    });
  
    // CONTRACT DEPLOYMENT
    describe("when the contract is deployed", async () => {
      it("the owner is set to the msg.sender", async () => {
        const owner = await auctionContract_.getOwner();
        console.log("Owner from contract:", owner);
        console.log("Deployer address:", deployer.address);
        expect(owner).to.be.eq(deployer.address);
      });
  
      it("the deployed time is set", async () => {
        const timeDeployed = await auctionContract_.deployedTime();
        console.log("Deployed time:", timeDeployed.toString());
        expect(Number(timeDeployed)).to.be.gt(0);
      });
  
      it("the auction item is set to an empty string", async () => {
        const item = await auctionContract_.getAuctionItem();
        console.log("Auction Item at deployment:", item);
        expect(item).to.eq("");
      });
  
      it("the auctionLive variable is set to false", async () => {
        const auctionLive = await auctionContract_.auctionLive();
        console.log("Auction live: ", auctionLive);
        expect(auctionLive).to.eq(false);
      });
    });
  
    // AUCTION SETUP
    describe("owner setting up auction parameters", async () => {
      it("owner sets the auction start time", async () => {
        // Get the current block timestamp
        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        const currentTime = block!.timestamp;
        console.log("current time is: ", currentTime);
  
        // Calculate the desired start time and set it
        const desiredStartTime = BigInt(currentTime) + BigInt(50);
        console.log("desired start time is: ", desiredStartTime);
        await auctionContract_.setStartAuctionTime(desiredStartTime);
  
        // Retrieve the start time from the contract
        const contractStartTime = await auctionContract_.getStartTime();
        console.log("contract start time set to: ", contractStartTime);
  
        // Check if the set start time is as expected
        expect(BigInt(contractStartTime)).to.equal(desiredStartTime);
      });
      it("owner sets the auction stop time", async () => {
        // Get the current block timestamp
        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        const currentTime = block!.timestamp;
        console.log("current time is: ", currentTime);
  
        // Calculate the desired stop time and set it
        const desiredStopTime = BigInt(currentTime) + BigInt(150);
        console.log("desired stop time is: ", desiredStopTime);
        await auctionContract_.setStopAuctionTime(desiredStopTime);
  
        // Retrieve the stop time from the contract
        const contractStopTime = await auctionContract_.getStopTime();
        console.log("contract stop time set to: ", contractStopTime);
  
        // Check if the set start time is as expected
        expect(BigInt(contractStopTime)).to.equal(desiredStopTime);
      });
      it("owner sets the auction item", async () => {
        await auctionContract_.setAuctionItem("potato");
        const item = await auctionContract_.getAuctionItem();
        console.log("Auction Item:", item);
        expect(item).to.eq("potato");
      });
    });
  
    // AUCTION LIVE ACTIONS
    describe("auction going live tests", async () => {
      it("contract should not go live if start time is less than the current time", async () => {
        // Get the current block timestamp
        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        const currentTime = block!.timestamp;
        console.log("current time is: ", currentTime);
  
        // Calculate the desired start time and set it wrong by making the start time less than the current time
        const desiredStartTime = BigInt(currentTime) - BigInt(50);
        console.log("desired start time is: ", desiredStartTime);
        await auctionContract_.setStartAuctionTime(desiredStartTime);
  
        // Calculate the desired stop time and set it
        const desiredStopTime = BigInt(currentTime) + BigInt(150);
        console.log("desired stop time is: ", desiredStopTime);
        await auctionContract_.setStopAuctionTime(desiredStopTime);
  
        // set the auction item
        await auctionContract_.setAuctionItem("potato");
        const item = await auctionContract_.getAuctionItem();
        console.log("Auction Item:", item);
  
        // expect start auction to fail due to start time being earlier than current time
        expect(auctionContract_.startAuction()).to.be.reverted;
      });
      it("should not go live if stop time is before start time", async () => {
        // Get the current block timestamp
        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        const currentTime = block!.timestamp;
        console.log("current time is: ", currentTime);
  
        // Calculate the desired start time and set it
        const desiredStartTime = BigInt(currentTime) + BigInt(50);
        console.log("desired start time is: ", desiredStartTime);
        await auctionContract_.setStartAuctionTime(desiredStartTime);
  
        // Calculate the desired stop time and set it earlier than the start time for test
        const desiredStopTime = BigInt(currentTime) + BigInt(15);
        console.log("desired stop time is: ", desiredStopTime);
        await auctionContract_.setStopAuctionTime(desiredStopTime);
  
        // set the auction item
        await auctionContract_.setAuctionItem("potato");
        const item = await auctionContract_.getAuctionItem();
        console.log("Auction Item:", item);
  
        // expect start auction to fail due to stop time being earlier than start time
        expect(auctionContract_.startAuction()).to.be.reverted;
      });
      it("contract should go live if the conditions start time, stop time and item are set", async () => {
        // Get the current block timestamp
        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        const currentTime = block!.timestamp;
        console.log("current time is: ", currentTime);
  
        // Calculate the desired start time and set it
        const desiredStartTime = BigInt(currentTime) + BigInt(50);
        console.log("desired start time is: ", desiredStartTime);
        await auctionContract_.setStartAuctionTime(desiredStartTime);
  
        // Calculate the desired stop time and set it
        const desiredStopTime = BigInt(currentTime) + BigInt(150);
        console.log("desired stop time is: ", desiredStopTime);
        await auctionContract_.setStopAuctionTime(desiredStopTime);
  
        // set the auction item
        await auctionContract_.setAuctionItem("potato");
        const item = await auctionContract_.getAuctionItem();
        console.log("Auction Item:", item);
  
        //contract go live
        await auctionContract_.startAuction();
        const auctionLive = await auctionContract_.auctionLive();
  
        expect(auctionLive).to.eq(true);
      });
    });
  
    // AUCTION BIDDING
    describe("auction bid tests", async () => {
      it("should not accept bids if the auction is not live", async () => {
        // Get the current block timestamp
        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        const currentTime = block!.timestamp;
        console.log("current time before going live is: ", currentTime);
  
        // Calculate the desired start time and set it
        const desiredStartTime = BigInt(currentTime) + BigInt(5);
        console.log("desired start time is: ", desiredStartTime);
        await auctionContract_.setStartAuctionTime(desiredStartTime);
  
        // Calculate the desired stop time and set it
        const desiredStopTime = BigInt(currentTime) + BigInt(6);
        console.log("desired stop time is: ", desiredStopTime);
        await auctionContract_.setStopAuctionTime(desiredStopTime);
  
        // set the auction item
        await auctionContract_.setAuctionItem("potato");
        const item = await auctionContract_.getAuctionItem();
        console.log("Auction Item:", item);
  
        //contract go live
        await auctionContract_.startAuction();
        const auctionLive = await auctionContract_.auctionLive();
        console.log("contract is live:", auctionLive);
  
        // wait 10 seconds
        await ethers.provider.send("evm_increaseTime", [10]);
        await ethers.provider.send("evm_mine");
  
        // Get the current block timestamp
        const blockNumber2 = await ethers.provider.getBlockNumber();
        const block2 = await ethers.provider.getBlock(blockNumber2);
        const currentTime2 = block2!.timestamp;
        console.log("current time after contract stopping 2 is: ", currentTime2);
        const auctionLive2 = await auctionContract_.auctionLive();
        console.log("contract is live:", auctionLive2);
  
        // stop auction
        await auctionContract_.stopAuction();
        const auctionStopped = await auctionContract_.auctionLive();
        console.log("contract is live after stopping:", auctionStopped);
  
        // test bid and expect to be reverted as auction is not live
        await expect(auctionContract_.bid({ value: parseEther("1") })).to.be
          .reverted;
      });
      it("should update the current highest bidder", async () => {
        // Get the current block timestamp
        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        const currentTime = block!.timestamp;
        console.log("current time before going live is: ", currentTime);
  
        // Calculate the desired start time and set it
        const desiredStartTime = BigInt(currentTime) + BigInt(5);
        console.log("desired start time is: ", desiredStartTime);
        await auctionContract_.setStartAuctionTime(desiredStartTime);
  
        // Calculate the desired stop time and set it
        const desiredStopTime = BigInt(currentTime) + BigInt(6);
        console.log("desired stop time is: ", desiredStopTime);
        await auctionContract_.setStopAuctionTime(desiredStopTime);
  
        // set the auction item
        await auctionContract_.setAuctionItem("potato");
        const item = await auctionContract_.getAuctionItem();
        console.log("Auction Item:", item);
  
        //contract go live
        await auctionContract_.startAuction();
        const auctionLive = await auctionContract_.auctionLive();
        console.log("contract is live:", auctionLive);
  
        // Connect the contract to different signers
        const auctionContractWithOwner = auctionContract_.connect(deployer);
        const auctionContractWithAccount1 = auctionContract_.connect(acct1);
  
        // Now use these to send transactions or make calls
        await auctionContractWithOwner.bid({ value: ethers.parseEther("1") });
        const highestBidder1 = await auctionContract_.highestBidder();
        console.log("highest bidder 1:", highestBidder1);
        await auctionContractWithAccount1.bid({ value: ethers.parseEther("2") });
        const highestBidder2 = await auctionContract_.highestBidder();
        console.log("highest bidder 2:", highestBidder2);
  
        // expect highest bidder1 is now less than highest biddder 2
        expect(highestBidder1).to.be.not.eq(highestBidder2);
      });
      it("should refund the previous highest bidder", async () => {
        // Get the current block timestamp
        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        const currentTime = block!.timestamp;
        console.log("current time before going live is: ", currentTime);
  
        // Calculate the desired start time and set it
        const desiredStartTime = BigInt(currentTime) + BigInt(5);
        console.log("desired start time is: ", desiredStartTime);
        await auctionContract_.setStartAuctionTime(desiredStartTime);
  
        // Calculate the desired stop time and set it
        const desiredStopTime = BigInt(currentTime) + BigInt(6);
        console.log("desired stop time is: ", desiredStopTime);
        await auctionContract_.setStopAuctionTime(desiredStopTime);
  
        // set the auction item
        await auctionContract_.setAuctionItem("potato");
        const item = await auctionContract_.getAuctionItem();
        console.log("Auction Item:", item);
  
        //contract go live
        await auctionContract_.startAuction();
        const auctionLive = await auctionContract_.auctionLive();
        console.log("contract is live:", auctionLive);
  
        // Connect the contract to different signers
        const auctionContractWithOwner = auctionContract_.connect(deployer);
        const auctionContractWithAccount1 = auctionContract_.connect(acct1);
  
        // balance of acct1 before acct2 bidding
        const initialBalanceAcct1 = await ethers.provider.getBalance(
          acct1.address
        );
        console.log("initial balance of acct1:", initialBalanceAcct1.toString());
  
        // acct1 bid
        await auctionContractWithOwner.bid({ value: ethers.parseEther("1") });
        const highestBidder1 = await auctionContract_.highestBidder();
        console.log("highest bidder 1:", highestBidder1);
  
        // acct2 bid new high bid
        await auctionContractWithAccount1.bid({ value: ethers.parseEther("2") });
        const highestBidder2 = await auctionContract_.highestBidder();
        console.log("highest bidder 2:", highestBidder2);
  
        // balance of acct1 after being outbid by acct2
        const afterOutbidBalanceAcct1 = await ethers.provider.getBalance(
          acct1.address
        );
        console.log(
          "balance of acct1 after being outbid:",
          afterOutbidBalanceAcct1.toString()
        );
  
        // expect acct1 balance before and after acct bid to be close to the same
        expect(afterOutbidBalanceAcct1).to.be.closeTo(
          initialBalanceAcct1,
          ethers.parseEther("10000")
        );
      });
    });
  
    // AUCTION END
    describe("ending the auction tests", async () => {
      it("should not end if the stop time is not reached", async () => {
        // Get the current block timestamp
        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        const currentTime = block!.timestamp;
        console.log("current time is: ", currentTime);
  
        // Calculate the desired start time and set it
        const desiredStartTime = BigInt(currentTime) + BigInt(5);
        console.log("desired start time is: ", desiredStartTime);
        await auctionContract_.setStartAuctionTime(desiredStartTime);
  
        // Calculate the desired stop time and set it
        const desiredStopTime = BigInt(currentTime) + BigInt(200);
        console.log("desired stop time is: ", desiredStopTime);
        await auctionContract_.setStopAuctionTime(desiredStopTime);
  
        // set the auction item
        await auctionContract_.setAuctionItem("potato");
        const item = await auctionContract_.getAuctionItem();
        console.log("Auction Item:", item);
  
        // Get the current block timestamp
        const blockNumber2 = await ethers.provider.getBlockNumber();
        const block2 = await ethers.provider.getBlock(blockNumber2);
        const currentTime2 = block2!.timestamp;
        console.log("current time 2 is: ", currentTime2);
  
        // auction start
        await auctionContract_.startAuction();
        const auctionLive = await auctionContract_.auctionLive();
        console.log("contract live:", auctionLive);
  
        // wait 20 seconds
        await ethers.provider.send("evm_increaseTime", [20]);
        await ethers.provider.send("evm_mine");
  
        //contract stop expect to fail as the stop time has not been reached
        await expect(auctionContract_.stopAuction()).to.be.reverted;
      });
      it("should correctly identify the winner", async () => {
        // Get the current block timestamp
        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        const currentTime = block!.timestamp;
        console.log("current time before going live is: ", currentTime);
  
        // Calculate the desired start time and set it
        const desiredStartTime = BigInt(currentTime) + BigInt(5);
        console.log("desired start time is: ", desiredStartTime);
        await auctionContract_.setStartAuctionTime(desiredStartTime);
  
        // Calculate the desired stop time and set it
        const desiredStopTime = BigInt(currentTime) + BigInt(15);
        console.log("desired stop time is: ", desiredStopTime);
        await auctionContract_.setStopAuctionTime(desiredStopTime);
  
        // set the auction item
        await auctionContract_.setAuctionItem("potato");
        const item = await auctionContract_.getAuctionItem();
        console.log("Auction Item:", item);
  
        // contract go live
        await auctionContract_.startAuction();
        const auctionLive = await auctionContract_.auctionLive();
        console.log("contract is live:", auctionLive);
  
        // Connect the contract to different signers
        const auctionContractWithOwner = auctionContract_.connect(deployer);
        const auctionContractWithAccount1 = auctionContract_.connect(acct1);
  
        // Now use these to send transactions or make calls
        await auctionContractWithOwner.bid({ value: ethers.parseEther("1") });
        const highestBidder1 = await auctionContract_.highestBidder();
        console.log("highest bidder 1:", highestBidder1);
        await auctionContractWithAccount1.bid({ value: ethers.parseEther("2") });
        const highestBidder2 = await auctionContract_.highestBidder();
        console.log("highest bidder 2:", highestBidder2);
  
        // wait 10 seconds
        await ethers.provider.send("evm_increaseTime", [10]);
        await ethers.provider.send("evm_mine");
  
        // contract stop
        await auctionContract_.stopAuction();
        const auctionLive2 = await auctionContract_.auctionLive();
        console.log("contract is live after being stopped:", auctionLive2);
  
        // get winner
        const winner = await auctionContract_.getWinner();
        console.log("wimmer:", winner);
  
        // expect the winner to be reached
        expect(winner[1]).to.be.gt(0);
      });
    });
  
    // WITHDRAWING FUNDS
    describe("winthdraw tests", async () => {
      it("should not allow withdrawal if auction is live", async () => {
        // Get the current block timestamp
        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        const currentTime = block!.timestamp;
        console.log("current time before going live is: ", currentTime);
  
        // Calculate the desired start time and set it
        const desiredStartTime = BigInt(currentTime) + BigInt(5);
        console.log("desired start time is: ", desiredStartTime);
        await auctionContract_.setStartAuctionTime(desiredStartTime);
  
        // Calculate the desired stop time and set it
        const desiredStopTime = BigInt(currentTime) + BigInt(6);
        console.log("desired stop time is: ", desiredStopTime);
        await auctionContract_.setStopAuctionTime(desiredStopTime);
  
        // set the auction item
        await auctionContract_.setAuctionItem("potato");
        const item = await auctionContract_.getAuctionItem();
        console.log("Auction Item:", item);
  
        //contract go live
        await auctionContract_.startAuction();
        const auctionLive = await auctionContract_.auctionLive();
        console.log("contract is live:", auctionLive);
  
        // Connect the contract to different signers
        const auctionContractWithOwner = auctionContract_.connect(deployer);
        const auctionContractWithAccount1 = auctionContract_.connect(acct1);
  
        // acct1 bid
        await auctionContractWithOwner.bid({ value: ethers.parseEther("1") });
        const highestBidder1 = await auctionContract_.highestBidder();
        console.log("highest bidder 1:", highestBidder1);
  
        // acct2 bid new high bid
        await auctionContractWithAccount1.bid({ value: ethers.parseEther("2") });
        const highestBidder2 = await auctionContract_.highestBidder();
        console.log("highest bidder 2:", highestBidder2);
  
        // expect withdraw to fail while auction is live
        expect(auctionContract_.withdraw(ethers.parseEther("1"))).to.be.reverted;
      });
      it("should allow the owner to withdraw funds", async () => {
        // Get the current block timestamp
        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        const currentTime = block!.timestamp;
        console.log("current time before going live is: ", currentTime);
  
        // Calculate the desired start time and set it
        const desiredStartTime = BigInt(currentTime) + BigInt(5);
        console.log("desired start time is: ", desiredStartTime);
        await auctionContract_.setStartAuctionTime(desiredStartTime);
  
        // Calculate the desired stop time and set it
        const desiredStopTime = BigInt(currentTime) + BigInt(6);
        console.log("desired stop time is: ", desiredStopTime);
        await auctionContract_.setStopAuctionTime(desiredStopTime);
  
        // set the auction item
        await auctionContract_.setAuctionItem("potato");
        const item = await auctionContract_.getAuctionItem();
        console.log("Auction Item:", item);
  
        //contract go live
        await auctionContract_.startAuction();
        const auctionLive = await auctionContract_.auctionLive();
        console.log("contract is live:", auctionLive);
  
        // Connect the contract to different signers
        const auctionContractWithOwner = auctionContract_.connect(deployer);
        const auctionContractWithAccount1 = auctionContract_.connect(acct1);
  
        // acct1 bid
        await auctionContractWithOwner.bid({ value: ethers.parseEther("1") });
        const highestBidder1 = await auctionContract_.highestBidder();
        console.log("highest bidder 1:", highestBidder1);
  
        // acct2 bid new high bid
        await auctionContractWithAccount1.bid({ value: ethers.parseEther("2") });
        const highestBidder2 = await auctionContract_.highestBidder();
        console.log("highest bidder 2:", highestBidder2);
  
        // wait 10 seconds
        await ethers.provider.send("evm_increaseTime", [10]);
        await ethers.provider.send("evm_mine");
  
        // stop auction
        await auctionContract_.stopAuction();
        const auctionLive2 = await auctionContract_.auctionLive();
        console.log("contract is live:", auctionLive2);
  
        // expect withdraw to go through after auction is over
        await expect(auctionContract_.withdraw(ethers.parseEther("1"))).to.not.be
          .reverted;
      });
    });
  
    // OWNERSHIP ACTIONS
    describe("ownership tests", async () => {
      it("should allow the owner to transfer ownership", async () => {
        // Get the current block timestamp
        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        const currentTime = block!.timestamp;
        console.log("current time is: ", currentTime);
  
        // Calculate the desired start time and set it
        const desiredStartTime = BigInt(currentTime) + BigInt(5);
        console.log("desired start time is: ", desiredStartTime);
        await auctionContract_.setStartAuctionTime(desiredStartTime);
  
        // Calculate the desired stop time and set it
        const desiredStopTime = BigInt(currentTime) + BigInt(200);
        console.log("desired stop time is: ", desiredStopTime);
        await auctionContract_.setStopAuctionTime(desiredStopTime);
  
        // set the auction item
        await auctionContract_.setAuctionItem("potato");
        const item = await auctionContract_.getAuctionItem();
        console.log("Auction Item:", item);
  
        //contract go live
        await auctionContract_.startAuction();
        const auctionLive = await auctionContract_.auctionLive();
        console.log("contract live:", auctionLive);
  
        const ownerAuction = await auctionContract_.getOwner();
        console.log("auction owner:", ownerAuction);
        console.log("deployer address", deployer.address);
        await auctionContract_.transferOwnership(acct1);
        const ownerAuction2 = await auctionContract_.getOwner();
        console.log("acct1 address", acct1.address);
        console.log("new auction owner:", ownerAuction2);
  
        expect(acct1.address).to.be.eq(ownerAuction2);
      });
    });
  });
  
    `;

  return (
    <SyntaxHighlighter language="solidity" style={docco}>
      {codeContractTests}
    </SyntaxHighlighter>
  );
};

export default DisplayContractTests;
