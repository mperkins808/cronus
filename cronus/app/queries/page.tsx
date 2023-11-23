"use client";

import Image from "next/image";
import axios from "axios";
import QueryEditor from "@/components/Queries/QueryEditor";
import { useEffect, useState } from "react";
import { fetchQueries } from "@/hooks/fetchQueries";
import styles from "./queries.module.css";
import Header from "@/components/Header/header";
import { redirect } from "next/navigation";
import isLoggedIn from "@/hooks/clientSide/isLoggedIn";
interface QUERY {
  id: string;
  name: string;
  datasource_id: string;
  raw_query: string;
  cronus_label: string | undefined;
  step: string;
  time: string;
  datasource_type: string;
  created_at: number;
}

export default function Home() {
  const [qs, setQS] = useState<[QUERY] | undefined>(undefined);
  const [refresh, setrefresh] = useState(false);

  async function fetchData() {
    console.log("fetching queries");
    const data = await fetchQueries();
    if (data !== undefined) {
      setQS(data);
    }
  }

  useEffect(() => {
    const ok = isLoggedIn();
    if (!ok) {
      redirect("/");
    }
    fetchData();
  }, [refresh]);

  if (!qs) {
    return <main></main>;
  }

  return (
    <main>
      <Header />

      <div className={styles.queryContainer}>
        <QueryEditor triggerRefresh={() => setrefresh(!refresh)} />
        {qs.map((q, i) => {
          return (
            <QueryEditor
              key={q.id}
              id={q.id}
              datasource_id={q.datasource_id}
              datasource_type={q.datasource_type}
              name={q.name === null ? "" : q.name}
              raw_query={q.raw_query}
              labelreplacer={q.cronus_label}
              step={q.step}
              time={q.time}
              triggerRefresh={() => setrefresh(!refresh)}
            />
          );
        })}
      </div>
    </main>
  );
}
