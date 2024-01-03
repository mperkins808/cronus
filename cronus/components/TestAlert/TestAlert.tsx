import axios from "axios";
import { useState } from "react";
import styles from "./styles.module.css";

export default function TestAlert() {
  const [err, setErr] = useState(false);
  const [sent, setSent] = useState(false);
  const [response, setResponse] = useState("");

  const testAlert = {
    receiver: "webhook_receiver",
    status: "firing",
    alerts: [
      {
        status: "firing",
        labels: {
          alertname: "TestAlert",
        },
        annotations: {
          description: "This alert tests that your alerts are working",
          summary: "Test Alert",
        },
        startsAt: "2023-12-19T07:21:39.057Z",
        endsAt: "0001-01-01T00:00:00Z",
        generatorURL: "placeholder",
        fingerprint: "placeholder",
      },
    ],
    groupLabels: {},
    commonLabels: {},
    commonAnnotations: {},
    externalURL: "http://f4475ac701f6:9093",
    version: "4",
    groupKey: "{}:{}",
    truncatedAlerts: 0,
  };

  async function sendTestAlert() {
    setSent(false);
    setErr(false);
    setResponse("");
    try {
      setSent(true);
      const resp = await axios.post("/api/forwardalerttosaas", testAlert, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (resp.status !== 200) {
        setResponse(resp.data.message);
        setErr(true);
        return;
      }
      setResponse("Message sent succesfully");
      setErr(false);
      return;
    } catch (error: any) {
      console.error(error);
      setErr(true);
      setResponse(error.response?.data.message);
    }
  }

  return (
    <>
      <div className={styles.container}>
        <h2>Test alert</h2>
        <p>
          Click the button to send a test alert to your devices, this confirms
          you have the configuration set up correctly
        </p>
        <button onClick={() => sendTestAlert()}>Send Alert</button>
        <p>{response}</p>
      </div>
    </>
  );
}
