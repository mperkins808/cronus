"use client";

import axios from "axios";
import styles from "./styles.module.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import isLoggedIn from "@/hooks/clientSide/isLoggedIn";
import Logout from "../Logout/Logout";

export default function Header() {
  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <Link href="/datasources">Cronus</Link>
      </div>
      <div className={styles.tabcontainer}>
        <Link href="/datasources">datasources</Link>
        <Link href="/queries">queries</Link>
        <Link href="/devices">devices</Link>
        <Link href="/alerts">alerts</Link>
      </div>
      <div className={styles.logout}>
        <Logout />
      </div>
    </div>
  );
}
