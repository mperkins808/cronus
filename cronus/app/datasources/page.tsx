"use client";

import Image from "next/image";
import axios from "axios";
import AddDatasource from "../../components/AddDatasource/AddDatasource";
import { useEffect, useState } from "react";
import { fetchDatasources } from "@/hooks/fetchDatasources";
import Header from "@/components/Header/header";
import styles from "./datasources.module.css";
import isLoggedIn from "@/hooks/clientSide/isLoggedIn";
import { redirect } from "next/navigation";

interface DATASOURCE {
  id: string;
  name: string;
  path: string;
  authheader?: string;
  created_at: number;
}

export default function Home() {
  const [ds, setDS] = useState<[DATASOURCE] | undefined>(undefined);
  const [refresh, setrefresh] = useState(false);

  async function fetchData() {
    console.log("fetching datasources");
    const data = await fetchDatasources();
    if (data !== undefined) {
      setDS(data);
    }
  }

  useEffect(() => {
    const ok = isLoggedIn();
    if (!ok) {
      redirect("/");
    }
    fetchData();
  }, [refresh]);

  if (!ds) {
    return <main></main>;
  }

  return (
    <main>
      <Header />
      <AddDatasource triggerRefresh={() => setrefresh(!refresh)} />
      <div className={styles.datasourcecontainer}>
        {ds.map((datasource, i) => {
          return (
            <AddDatasource
              key={datasource.id}
              id={datasource.id}
              name={datasource.name}
              path={datasource.path}
              auth={datasource.authheader}
              triggerRefresh={() => setrefresh(!refresh)}
            />
          );
        })}
      </div>
    </main>
  );
}
