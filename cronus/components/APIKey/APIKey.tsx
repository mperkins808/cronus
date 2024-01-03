import { checkAPIKeyInDB } from "@/hooks/clientSide/apikeyvalidation";
import axios from "axios";
import styles from "./styles.module.css";
import { useEffect, useState } from "react";
import SyncDevices from "../SyncDevices/SyncDevices";

export default function () {
  const [keyfound, setKeyfound] = useState(false);
  const [keyrequested, setKeyrequested] = useState(false);
  const [newkey, setNewKey] = useState("");
  const [err, setErr] = useState("");
  const [requestedUpdate, setRequestedUpdate] = useState(false);
  useEffect(() => {
    setKeyrequested(false);
    checkAPIKeyInDB().then((res) => {
      setKeyfound(res);
      setKeyrequested(true);
    });
  }, []);

  const deleteAPIKey = async () => {
    setErr("");
    setRequestedUpdate(false);
    try {
      setRequestedUpdate(true);
      const resp = await axios.delete("/api/apikey");
      if (resp.status !== 200) {
        setErr("failed to delete key");
        console.error(resp.data);
        return;
      }
      setKeyfound(false);
    } catch (error) {
      console.error(error);
      setErr("failed to delete key ");
    }
  };

  const setNewAPIKey = async () => {
    setErr("");
    setRequestedUpdate(false);
    try {
      setRequestedUpdate(true);
      const resp = await axios.post(`/api/saasconnection?apikey=${newkey}`);
      if (resp.status !== 200) {
        console.error(resp.data);
        setErr(resp.data.message);
        return;
      }

      setKeyfound(true);
      setNewKey("");
    } catch (error: any) {
      console.error(error.response?.data);
      setErr(error.response?.data.error);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Manage API Key </h2>
      {keyrequested && keyfound && (
        <>
          <div className={styles.enterNewKey}>
            <p>API Key is set</p>
            <button onClick={async () => deleteAPIKey()}>Delete</button>
            {requestedUpdate && err !== "" && (
              <p style={{ color: "red" }}>{err}</p>
            )}
          </div>
          <SyncDevices sync={true} />
        </>
      )}
      {keyrequested && !keyfound && (
        <>
          <div className={styles.enterNewKey}>
            <input
              value={newkey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="enter key here"
              type="password"
            />
            <button onClick={async () => setNewAPIKey()}>Set</button>
            {requestedUpdate && err !== "" && (
              <p style={{ color: "red" }}>{err}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
