"use client";

import Image from "next/image";
import axios from "axios";
import QueryEditor from "@/components/Queries/QueryEditor";
import { useEffect, useState } from "react";
import { fetchDevices } from "@/hooks/fetchDevices";
import styles from "./devices.module.css";
import Header from "@/components/Header/header";
import { redirect } from "next/navigation";
import { useSearchParams } from "next/navigation";

import isLoggedIn from "@/hooks/clientSide/isLoggedIn";
import ViewDevice from "@/components/ViewDevice/viewDevice";
import EnrolNewDevice from "@/components/EnroleNewDevice/enroleNewDevice";

interface DEVICE {
  username: string;
  displayname: string | null;
  deviceid: string | undefined;
  alertsenabled: boolean | null;
}

export default function Home() {
  const [refresh, setrefresh] = useState(false);
  const [dS, setDS] = useState<[DEVICE] | undefined>(undefined);
  const [dsCount, setDSCount] = useState(0);
  const [initPull, setInitPull] = useState(false);
  const searchParams = useSearchParams();
  const refreshTime = 1000;

  useEffect(() => {
    const ok = isLoggedIn();
    if (!ok) {
      redirect("/");
    }

    fetchData();
    const intervalId = setInterval(fetchData, refreshTime);
  }, [refresh]);

  async function fetchData() {
    const data = await fetchDevices();
    if (data !== undefined) {
      if (dsCount !== data.length) {
        setDS(data);
      }
      if (!initPull) {
        setDSCount(data.length);
        setInitPull(true);
      }
    }
  }

  return (
    <main className={styles.deviceContainer}>
      <Header />
      <EnrolNewDevice
        active={searchParams?.get("new") !== null ? true : false}
      />
      {dS && dS.length > 0 && (
        <div className={styles.currentDevicesContainer}>
          <h2>Current Devices</h2>
        </div>
      )}
      {dS &&
        dS.map((d, i) => {
          return (
            <ViewDevice
              username={d.username}
              displayname={d.displayname}
              alertsEnabled={d.alertsenabled}
              deviceid={d.deviceid}
              key={d.username}
              triggerRefresh={() => setrefresh(!refresh)}
            />
          );
        })}
    </main>
  );
}
