import { useState } from "react";
import styles from "./styles.module.css";
import axios from "axios";

interface VIEW_DEVICE_PROPS {
  username: string;
  displayname: string | null;
  triggerRefresh: () => void;
}

export default function ViewDevice(props: VIEW_DEVICE_PROPS) {
  const [username, setUsername] = useState(props.username);
  const [updateColor, setUpdateColor] = useState("");
  const [deleteColor, setDeleteColor] = useState("");

  const [displayName, setDisplayname] = useState(
    props.displayname ? props.displayname : props.username
  );

  async function updateDisplayName() {
    setUpdateColor("");
    const Q = `/api/users?username=${username}&displayname=${displayName}`;
    try {
      const resp = await axios.patch(Q);
      if (resp.status !== 201) {
        setUpdateColor("red");
      } else {
        setUpdateColor("green");
      }
    } catch (error) {
      console.error(error);
      setUpdateColor("red");
    }
  }

  async function deleteDevice() {
    setDeleteColor("red");
    const Q = `/api/users?username=${username}`;
    try {
      const resp = await axios.delete(Q);
      if (resp.status !== 200) {
        setDeleteColor("red");
      } else {
        setDeleteColor("green");
        props.triggerRefresh();
      }
    } catch (error) {
      console.error(error);
      setDeleteColor("red");
    }
  }

  return (
    <div className={styles.container}>
      <input
        value={displayName}
        onChange={(e) => setDisplayname(e.target.value)}
      />
      <button
        className={styles.update}
        style={{ backgroundColor: updateColor }}
        onClick={() => updateDisplayName()}
      >
        update
      </button>
      <button
        className={styles.delete}
        style={{ backgroundColor: deleteColor }}
        onClick={() => deleteDevice()}
      >
        delete
      </button>
    </div>
  );
}
