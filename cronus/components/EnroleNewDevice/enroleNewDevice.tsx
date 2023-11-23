"use client";
import axios from "axios";
import styles from "./styles.module.css";
import QRCode from "react-qr-code";
import Countdown from "react-countdown";
import { usePathname } from "next/navigation";

import { useEffect, useRef, useState } from "react";

interface CHALLENGE_RESPONSE {
  passcode: string;
  id: string;
  exp: number;
}

interface EnroleNewDeviceProps {
  active?: boolean;
}

export default function EnrolNewDevice(props: EnroleNewDeviceProps) {
  const canvasRef = useRef(null);
  const [challengeResp, setChallengeResp] = useState<
    CHALLENGE_RESPONSE | undefined
  >(undefined);
  const pathname = usePathname();
  const [now, SetNow] = useState(0);
  const [host, setHost] = useState("");
  const [protocol, setProtocol] = useState("");
  const [baseurl, setBaseURL] = useState("");
  useEffect(() => {
    if (props.active === true) makeChallenge();
    setHost(window.location.host.split(":")[0]);
    setProtocol(window.location.protocol);
    const b = `${window.location.protocol}//${window.location.host}`;
    setBaseURL(b);
  }, []);

  async function makeChallenge() {
    try {
      const resp = await axios.get("/api/makechallenge");
      if (resp.status !== 200) return;

      const c: CHALLENGE_RESPONSE = resp.data;
      setChallengeResp(c);
      const n = Date.now();
      SetNow(n);
    } catch (error) {
      console.error(error);
    }
  }

  const QRCodeStyle = {
    margin: "auto",
    marginTop: "1rem",
  };

  return (
    <div className={styles.container}>
      <button onClick={() => makeChallenge()} className={styles.addDeviceBtn}>
        Add a device
      </button>
      {challengeResp && (
        <div className={styles.qrCode}>
          <h2> Enter the following code on your device</h2>
          <h2>{challengeResp.passcode}</h2>
          {<Countdown date={now + 60000} renderer={renderer} />}

          {/* <h4>{challengeResp.exp}</h4> */}
          <QRCode
            value={`cronus://connect?baseurl=${baseurl}&host=${host}&id=${challengeResp.id}`}
            viewBox={`0 0 256 256`}
            style={QRCodeStyle}
          />
        </div>
      )}
    </div>
  );
}

interface CountdownRendererProps {
  seconds: number;
  completed: boolean;
}

const renderer: React.FC<CountdownRendererProps> = ({ seconds, completed }) => {
  if (completed) {
    return <h4>expired</h4>;
  }
  if (seconds === 0) return <h4>expires in 60</h4>;
  return <h4>expires in {seconds}</h4>;
};
