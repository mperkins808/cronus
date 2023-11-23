"use client";

// import Image from "next/image";
// import axios from "axios";
// import AddDatasource from "../../components/AddDatasource/AddDatasource";
// import { useEffect, useState } from "react";
// import { fetchDatasources } from "@/hooks/fetchDatasources";
import Header from "@/components/Header/header";
import styles from "./alerts.module.css";
// import isLoggedIn from "@/hooks/clientSide/isLoggedIn";
// import { redirect } from "next/navigation";

export default function Home() {
  return (
    <main>
      <Header />
      <div className={styles.container}>
        <div className={styles.nocontent}>
          <h1>Alerts coming soon</h1>
          <br />
          <p>
            Get push notifications to your mobile. Will include alerts from
            prometheus alertmanager, Grafana and custom alerts within cronus.
          </p>
        </div>
      </div>
    </main>
  );
}
