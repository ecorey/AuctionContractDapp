import {
  useAccount,
  useBalance,
  useContractRead,
  useContractWrite,
  useNetwork,
} from "wagmi";

import { sepolia } from "wagmi";
import { configureChains } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { InjectedConnector } from "wagmi/connectors/injected";
import styles from "./instructionsComponent.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DisplayContractCode from "./codeDisplay";
import DisplayContractTests from "./testDisplay";
import ReactDOMServer from "react-dom/server";

// fix this hard code to another file
const contractABI = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "officialStop",
        type: "uint256",
      },
    ],
    name: "AuctionEnded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "officialStart",
        type: "uint256",
      },
    ],
    name: "AuctionStarted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "currentBid",
        type: "uint256",
      },
    ],
    name: "BidPlaced",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "winner",
        type: "address",
      },
    ],
    name: "Winner",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Withdraw",
    type: "event",
  },
  {
    inputs: [],
    name: "auctionLive",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "bid",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "bids",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "curentTime",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "deployedTime",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "funds",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAuctionItem",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getContractBalance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCurrentBid",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCurrentTime",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getOwner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getStartTime",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getStopTime",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getWinner",
    outputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "highestBidder",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "_auctionItem", type: "string" }],
    name: "setAuctionItem",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_startTime", type: "uint256" }],
    name: "setStartAuctionTime",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_stopTime", type: "uint256" }],
    name: "setStopAuctionTime",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "startAuction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "startTime",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "stopAuction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "stopTime",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "winner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_amount", type: "uint256" }],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

/**
 * @dev calls the Page Body
 */
export default function InstructionsComponent() {
  return (
    <div className={styles.container}>
      <header className={styles.header_container}>
        <div className={styles.header}>
          <h1>'YOU DROPPED THIS KING' </h1>
          <h1>AUCTION</h1>
          <h1>Limited Time</h1>
        </div>
      </header>
      <p className={styles.get_started}>
        <PageBody></PageBody>
      </p>
    </div>
  );

  /**
   * @dev calls the Wallet Info
   */
  function PageBody() {
    return (
      <div>
        <WalletInfo></WalletInfo>
      </div>
    );
  }

  /**
   * contains the called components
   */

  function WalletInfo() {
    const { address, isConnecting, isDisconnected } = useAccount();
    const { chains, publicClient } = configureChains(
      [sepolia],
      [
        alchemyProvider({ apiKey: "PVsdQRGuGDwT2mm_Hs5ua-cepAVD0caw" }),
        publicProvider(),
      ]
    );

    if (address)
      return (
        <div>
          <WalletBalance address={address}></WalletBalance>
          <DeployedTime></DeployedTime>
          <AuctionLive></AuctionLive>
          <Owner></Owner>
          <>
            Etherscan Details:
            https://sepolia.etherscan.io/address/0x22090522d78127110f260131e0743228098db04a#code{" "}
          </>
          <DisplayContract></DisplayContract>
          <DisplayTests></DisplayTests>
        </div>
      );
    if (isConnecting)
      return (
        <div>
          <p>Loading...</p>
        </div>
      );
    if (isDisconnected)
      return (
        <div>
          <p>Wallet disconnected. Connect wallet to continue</p>
        </div>
      );
    return (
      <div>
        <p>Connect wallet to continue</p>
      </div>
    );
  }

  /**
   * @dev returns the wallet blance
   */
  function WalletBalance(params: { address: `0x${string}` }) {
    const { data, isError, isLoading } = useBalance({
      address: params.address,
    });

    if (isLoading) return <div>Fetching balance…</div>;
    if (isError) return <div>Error fetching balance</div>;
    return (
      <div>
        Balance: {data?.formatted} {data?.symbol}
      </div>
    );
  }

  // Function for timestamo
  function CurrentTime() {
    // Getting current timestamp in seconds
    const currentTimestamp = Math.floor(Date.now() / 1000);

    return (
      <div>
        <p>Current time is: {currentTimestamp}</p>
      </div>
    );
  }

  // READ FUNCTIONS

  /**
   * @notice returns the owner of the contract
   */
  function Owner() {
    const { data, isError, isLoading } = useContractRead({
      address: "0x22090522d78127110f260131E0743228098Db04A",
      abi: contractABI,

      functionName: "getOwner",
      onSuccess(data) {
        console.log("Success", data);
      },
      onError(error) {
        console.log("Error", error);
      },
    });

    const owner = typeof data === "string" ? data : 0;

    if (isLoading) return <div>Fetching owner....</div>;
    if (isError) return <div>Error fetching owner</div>;
    return <div>Owner Address: {owner}</div>;
  }
}

function AuctionLive() {
  const { data, isError, isLoading } = useContractRead({
    address: "0x22090522d78127110f260131E0743228098Db04A",
    abi: contractABI,

    functionName: "auctionLive",
    onSuccess(data) {
      console.log("Success", data);
    },
    onError(error) {
      console.log("Error", error);
    },
  });

  const live = typeof data === "boolean" ? data : 0;

  if (isLoading) return <div>Fetching if auction is live....</div>;
  if (isError) return <div>Error fetching if auction is live</div>;
  return <div>Auction is Live: {live.toString()}</div>;
}

function DeployedTime() {
  const { data, isError, isLoading } = useContractRead({
    address: "0x22090522d78127110f260131E0743228098Db04A",
    abi: contractABI,

    functionName: "deployedTime",
    onSuccess(data) {
      console.log("Success Data:", data, "Type:", typeof data);
    },
    onError(error) {
      console.log("Error", error);
    },
  });

  // const deployedT = typeof data === "string" ? data.toString() : 0;
  const deployedT: any = data;

  if (isLoading) return <div>Fetching deployed time....</div>;
  if (isError) return <div>Error fetching deployed time</div>;
  return <div>Deployed TIme: {deployedT.toString()}</div>;
}

const DisplayContract: React.FC = () => {
  const openNewWindow = () => {
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      const codeComponentHtml = ReactDOMServer.renderToString(
        <div id="code-component" style={{ display: styles.get_started }}>
          <DisplayContractCode />
        </div>
      );
      newWindow.document.write(
        `<html><head><title>Auction.sol</title></head><body>${codeComponentHtml}</body></html>`
      );
      newWindow.document.close();
    }
  };

  return (
    <div>
      <button onClick={openNewWindow}>
        View the Auction.sol Contract in a New Window
      </button>
    </div>
  );
};

const DisplayTests: React.FC = () => {
  const openNewWindow = () => {
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      const codeTestComponentHtml = ReactDOMServer.renderToString(
        <div id="code-component" style={{ display: styles.get_started }}>
          <DisplayContractTests />
        </div>
      );
      newWindow.document.write(
        `<html><head><title>Auction.ts</title></head><body>${codeTestComponentHtml}</body></html>`
      );
      newWindow.document.close();
    }
  };

  return (
    <div>
      <button onClick={openNewWindow}>
        View the Auction.sol Contract TESTS in a New Window
      </button>
    </div>
  );
};

