import React, { useState, useEffect } from "react";
import { ConnectKitButton } from "connectkit";
import styles from "./Navbar.module.css";

function CurrentTime() {
  const [currentTimestamp, setCurrentTimestamp] = useState(
    Math.floor(Date.now() / 1000)
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTimestamp(Math.floor(Date.now() / 1000));
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);
  return (
    <h4>
      <p>Current time is: {currentTimestamp}</p>
    </h4>
  );
}

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <a
        href="https://alchemy.com/?a=create-web3-dapp"
        target="_blank"
        rel="noreferrer"
      >
        <CurrentTime />
      </a>
      <ConnectKitButton />
    </nav>
  );
}
