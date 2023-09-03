import Image from "next/image";
import styles from "./footer.module.css";
import myImage from "./images/99.png";
import Ticker from "../../ticker";

export default function Footer() {
  return (
    <div className={styles.footer}>
      <Image src={myImage} alt="Description" width={152} height={152} />
      <div className={styles.container2}>
        <Ticker></Ticker>
      </div>
    </div>
  );
}
