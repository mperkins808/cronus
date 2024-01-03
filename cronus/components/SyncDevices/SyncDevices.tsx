import { checkAPIKeyInDB } from "@/hooks/clientSide/apikeyvalidation";
import axios from "axios";
import styles from "./styles.module.css";
import { useEffect, useState } from "react";

export interface SYNC_DEVICES_PROPS {
  sync: boolean;
}

export default function SyncDevices(props: SYNC_DEVICES_PROPS) {
  const [err, setErr] = useState(false);
  const [requestedUpdate, setRequestedUpdate] = useState(false);

  useEffect(() => {
    if (!props.sync) return;

    console.log("syncing devices");
  }, [props.sync]);

  const requestSync = async () => {
    setErr(false);
    setRequestedUpdate(false);
    try {
      setRequestedUpdate(true);
      const resp = await axios.post(`/api/syncdevices`);
      if (resp.status !== 200) {
        setErr(true);
        console.error(resp.data);
        return;
      }
      setErr(false);
      setRequestedUpdate(false);
    } catch (error: any) {
      console.error(error.response?.data);
      setErr(error.response?.data.error);
      setErr(true);
      setRequestedUpdate(false);
    }
  };

  return (
    <>
      <div className={styles.container}>
        {!err && requestedUpdate && <p> syncing devices... </p>}
        {err && requestedUpdate && <p> failed to sync </p>}
        {!err && !requestedUpdate && <p> devices are synced </p>}
      </div>
    </>
  );
}
