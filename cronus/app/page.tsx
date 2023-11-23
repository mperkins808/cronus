"use client";

import Login from "@/components/Login/Login";
import isLoggedIn from "@/hooks/clientSide/isLoggedIn";
import { useEffect, useState } from "react";
import styles from "./index.module.css";
import { redirect } from "next/navigation";
import axios from "axios";

export default function Home() {
  const [user, setUser] = useState(isLoggedIn());
  const [h, setH] = useState(false);

  useEffect(() => {
    setUser(isLoggedIn());
    if (!h) setH(true);

    axios.patch("/api/createfirstuser");
  }, []);

  if (!h) return null;

  if (user) {
    redirect("/datasources");
  }

  return (
    <main className={styles.container}>
      <div className={styles.children}>
        <h1>Welcome to Cronus</h1>
        <Login />
      </div>
    </main>
  );
}
