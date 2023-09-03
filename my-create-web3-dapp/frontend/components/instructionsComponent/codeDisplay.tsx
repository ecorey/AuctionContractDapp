import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";

const DisplayContractCode = () => {
  const codeContract = `
// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;


/**
@title Auction.sol
@notice contract to create an auction
*/


/** 
The logic of this contract is that fist the contract is deployed and then it can be reused many times.  The current time can be
found out at any time by calling the currentTime function to set the current time variable, and then caliing the variable. For an auction to occur
 the owner of the contract must:
 1) set the auction item 
 2) the auction start time after the current time and before the stopTime
 3) set the stop time 
 4) call startAuction
 5) bids are then placed by anyone with bids returned as new high bids are placed
 6) owner will then call stop auction after stop time
 7) winner can then be seen with winning bid and winning item displayed  by calling the getAuctionItem function
 8) owner can then withdraw the contractbalance which is the highest bid
*/



contract Auction {

    // STATE VARIABLES
    address private owner;
    address public highestBidder;
    address public winner;
    string private auctionItem;
    uint256 public deployedTime;
    uint256 public curentTime;
    uint256 public startTime;
    uint256 public stopTime;
    uint256 private currentBid;
    bool public auctionLive;
    uint256 public funds;

    // mapping of address to the bids they make 
    mapping(address => uint256) public bids;

    // MODIFIERS
    modifier onlyOwner(){
        require(msg.sender == owner, "not the owner");
        _;}


    // EVENTS
    event AuctionStarted(uint256 officialStart);
    event AuctionEnded(uint officialStop);
    event BidPlaced(uint256 currentBid);
    event Winner(address winner);
    event Withdraw(address account, uint256 amount);

    // CONSTRUCTOR
    constructor() {
        owner = msg.sender;
        deployedTime = block.timestamp;
        auctionItem = "";
        auctionLive = false;

    }


    // FUNCTIONS
    
    // set the auction's necessary conditions 
    function setStartAuctionTime(uint256 _startTime) public onlyOwner {
        startTime = _startTime;
    }

    function setStopAuctionTime(uint256 _stopTime) public onlyOwner {
        stopTime = _stopTime;
    }

    
    function setAuctionItem(string memory _auctionItem) public onlyOwner {
        auctionItem = _auctionItem;
    }

    // START AUCTION
    function startAuction () public onlyOwner {
        require(bytes(auctionItem).length > 0, "auction item NOT set");
        require(startTime > getCurrentTime(), "start time is not after the current time");
        require(stopTime > startTime, "stop time is not set after start time");

        auctionLive = true;
        emit AuctionStarted(block.timestamp);


    }

    // STOP AUCTION
    function stopAuction() public onlyOwner {
        require(getCurrentTime() > stopTime, "auction is still live");

        // sets the winner to the highestBidder and emits the event
        winner = highestBidder;

        // sets withdraw amount for contract owner
        funds = currentBid;

        auctionLive = false;

        emit Winner(winner);

        emit AuctionEnded(block.timestamp);

    }


    function  getAuctionItem() public view returns(string memory) {
        return (auctionItem);

    }

    
    // time functions
    function getCurrentTime() public  returns(uint256){
        curentTime = block.timestamp;
        return(curentTime);
    }


    function getStartTime() public view returns(uint256){
        return(startTime);
    }


    function getStopTime() public view returns(uint256){
        return(stopTime);
    }

    
    // bid functions
    function bid() public payable {
        require(auctionLive == true, "auction is not live");
        require(msg.value > currentBid, "Bid not high enough");

        // if the bid is higher than the currentBid, the bid becomes the new currentBid and 
        // the msg.sender becomes the highest bidder and the last highest bidder is refunded
        if (highestBidder != address(0)) {
            payable(highestBidder).transfer(currentBid);  
        }

        // update state variables 
        currentBid = msg.value;
        highestBidder = msg.sender;

        // Update bids mapping
        bids[msg.sender] = msg.value;

        emit BidPlaced(currentBid);

    }

    function getCurrentBid() public view returns(uint256) {
        return(currentBid);
    }


    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // withdraw function
    function withdraw(uint256 _amount) public onlyOwner {
        // check auction ended and the amount to withdraw is less than funds in contract 
        require(auctionLive == false, "wait until the auction has ended before withdrawing");
        require(_amount <= funds, "amount to withdraw too high");

        
        // effects
        funds -= _amount;

        // interaction with blockchain and emit event
        payable(owner).transfer(_amount);

        emit Withdraw(msg.sender, _amount);
    }



    // ownership functions
    function getOwner() public view returns(address){
        return(owner);
    }

    function transferOwnership(address newOwner) public onlyOwner {
        owner = newOwner;
    }
    

    // GET WINNER
    function getWinner() public view onlyOwner returns(address, uint256) {
        require(auctionLive == false, "auction is still live");
        require(winner != address(0), "winner is NOT set");

        return (highestBidder, bids[highestBidder]);


    }


}

  `;

  return (
    <SyntaxHighlighter language="solidity" style={docco}>
      {codeContract}
    </SyntaxHighlighter>
  );
};

export default DisplayContractCode;
