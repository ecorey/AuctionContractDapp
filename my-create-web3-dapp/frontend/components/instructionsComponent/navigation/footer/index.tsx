import Image from "next/image";
import styles from "./footer.module.css";
import myImage from "./images/cat1.png";

export default function Footer() {
  return (
    <div className={styles.footer}>
      <Image src={myImage} alt="Description" width={152} height={152} />
    </div>
  );
}
