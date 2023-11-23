"use client";

import axios from "axios";
import styles from "./styles.module.css";
import { cookies } from "next/headers";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import isLoggedIn from "@/hooks/clientSide/isLoggedIn";

export default function LogoutBtn() {
  const { push } = useRouter();

  async function reqLogout() {
    try {
      const resp = await axios.get(`/api/logout`);
      if (resp.status !== 200) {
        console.error(resp.data);
      }
    } catch (error) {
      console.error(error);
    }
    push("/");
  }

  return (
    <div className={styles.container}>
      <button onClick={() => reqLogout()}>Logout</button>
    </div>
  );
}
