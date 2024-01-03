"use client";

// import Image from "next/image";
// import axios from "axios";
// import AddDatasource from "../../components/AddDatasource/AddDatasource";
// import { useEffect, useState } from "react";
// import { fetchDatasources } from "@/hooks/fetchDatasources";
import Header from "@/components/Header/header";
import styles from "./alerts.module.css";
import APIKey from "@/components/APIKey/APIKey";
import TestAlert from "@/components/TestAlert/TestAlert";
import { generateAlertingURL } from "@/hooks/clientSide/urls";
// import isLoggedIn from "@/hooks/clientSide/isLoggedIn";
// import { redirect } from "next/navigation";

export default function Home() {
  return (
    <main>
      <Header />
      <div className={styles.container}>
        <div className={styles.guide}>
          <br />
          <h2>Alerts</h2>
          <p>Forward any alerts to the Cronus mobile app. </p>

          <div>
            <h3>Step 1.</h3>
            <p>
              First go to{" "}
              <a
                className={styles.link}
                href="https://cronusmonitoring.com/apitokens"
              >
                cronusmonitoring.com/apitokens
              </a>{" "}
              and get an API key.
            </p>
          </div>

          <div>
            <h3>Step 2.</h3>
            <p> Set the API key here</p>
          </div>

          <div>
            <h3>Step 3.</h3>
            <span>
              {" "}
              Forward your alerts to either{" "}
              <p className={styles.link}>{generateAlertingURL(window)}</p> or
              <p className={styles.link}>
                {" "}
                https://cronusmonitoring.com/api/alert
              </p>
            </span>
          </div>

          <div>
            <h3>Step 4.</h3>
            <p>
              {" "}
              Go to the Devices page and set which devices you would like to
              receive alerts.
            </p>
          </div>

          <APIKey />
          <TestAlert />
        </div>
      </div>
    </main>
  );
}
