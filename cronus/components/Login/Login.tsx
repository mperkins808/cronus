"use client";

import axios from "axios";
import styles from "./styles.module.css";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import isLoggedIn from "@/hooks/clientSide/isLoggedIn";

export default function LoginPage() {
  const goodState = { borderColor: "" };
  const badState = { borderColor: "red" };

  const [username, setUsername] = useState("");
  const [badU, setBadU] = useState(goodState);
  const [password, setPassword] = useState("");
  const [newpassword, setNewPassword] = useState("");
  const [badP, setBadP] = useState(goodState);
  const [err, setErr] = useState("");
  const [user, setUser] = useState(isLoggedIn());
  const [successfulLogin, setSuccessfullogin] = useState(false);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setBadP(goodState);
    setBadU(goodState);
    setErr("");

    if (password === "") setBadP(badState);
    if (username === "") setBadU(badState);
    if (password === "" || username === "") return;

    try {
      const resp = await axios.get(
        `/api/login?username=${username}&password=${password}`
      );
      if (resp.status !== 200) {
        setErr("username or password are invalid");
        return;
      }
      setSuccessfullogin(true);
      // push("/datasources");
    } catch (error) {
      console.error(error);
      setErr("username or password are invalid");
      return;
    }
  };

  return (
    <div>
      {!successfulLogin && (
        <div className={styles.container}>
          <form className={styles.form} onSubmit={handleLogin}>
            <div>
              <input
                type="text"
                id="username"
                value={username}
                placeholder="username"
                style={badU}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <input
                type="password"
                id="password"
                placeholder="password"
                value={password}
                style={badP}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button className={styles.loginBtn} type="submit">
              Login
            </button>
            <div>
              <p>{err}</p>
            </div>
          </form>
        </div>
      )}
      {successfulLogin && (
        <ChangePassword password={password} username={username} />
      )}
    </div>
  );
}

interface ChangePasswordProps {
  password: string;
  username: string;
}
function ChangePassword(props: ChangePasswordProps) {
  const goodState = { borderColor: "" };
  const badState = { borderColor: "red" };

  const [p, setP] = useState(props.password);
  const [newP, setNewP] = useState("");
  const [err, setErr] = useState("");
  const { push } = useRouter();
  const [badP, setBadP] = useState(goodState);
  const [badNP, setBadNP] = useState(goodState);

  const handleChangePassword = async (e: any) => {
    e.preventDefault();

    setErr("");
    setBadNP(goodState);
    setBadP(goodState);
    setErr("");

    if (p === "") setBadP(badState);
    if (newP === "") setBadNP(badState);
    if (p === "" || newP === "") return;

    try {
      const resp = await axios.patch(
        `/api/users?username=${props.username}&displayname=${props.username}&password=${p}&newpassword=${newP}`
      );
      if (resp.status !== 201) {
        setErr("passwords do not match");
        return;
      }
      push("/datasources");
    } catch (error) {
      console.error(error);
      setErr("passwords do not match");
      return;
    }
  };

  const handleCancel = () => {
    push("/datasources");
  };
  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleChangePassword}>
        <div>
          <input
            type="password"
            id="password"
            placeholder="password"
            value={p}
            style={badP}
            onChange={(e) => setP(e.target.value)}
          />
        </div>
        <div>
          <input
            type="password"
            id="newpassword"
            placeholder="new password"
            value={newP}
            style={badNP}
            onChange={(e) => setNewP(e.target.value)}
          />
        </div>
        <button className={styles.loginBtn} type="submit">
          Update
        </button>
        <button className={styles.loginBtn} onClick={handleCancel}>
          Not this time
        </button>
        <div>
          <p>{err}</p>
        </div>
      </form>
    </div>
  );
}
