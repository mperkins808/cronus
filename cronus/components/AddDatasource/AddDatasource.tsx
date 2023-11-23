import { useState } from "react";
import styles from "./styles.module.css";
import axios from "axios";

interface props {
  id?: string;
  name?: string;
  path?: string;
  auth?: string;
  triggerRefresh: () => void;
}

export default function Home(props: props) {
  const [name, setName] = useState(props.name ? props.name : "");

  const [path, setPath] = useState(props.path ? props.path : "");
  const [auth, setAuth] = useState(props.auth ? props.auth : "");
  const [authVis, setAuthVis] = useState(props.auth ? "password" : "text");
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [btnColor, setBtnColor] = useState("");

  const validateDatasource = async (path: string) => {
    let ok = false;
    try {
      const resp = await axios.get(
        `/api/healthcheck?path=${path}&authheader=${auth}`
      );
      if (resp.status === 200) {
        ok = true;
      }
    } catch (err) {
      setBtnColor("red");
    }

    if (!ok) return;
    try {
      const created_at = Math.floor(Date.now() / 1000);
      if (props.id === undefined) {
        const resp = await axios.post(
          `/api/datasource?name=${name}&path=${path}&created_at=${created_at}&authheader=${auth}`
        );
        if (resp.status === 201) {
          ok = true;
          props.triggerRefresh();
        }
      } else {
        const resp = await axios.patch(
          `/api/datasource?id=${props.id}&name=${name}&path=${path}&created_at=${created_at}&authheader=${auth}`
        );
        if (resp.status === 201) {
          ok = true;
          props.triggerRefresh();
        }
      }
      if (ok) {
        setBtnColor("green");
      } else {
        setBtnColor("red");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const deleteDatasource = async (id: string) => {
    try {
      const resp = await axios.delete(`/api/datasource?id=${id}`);
      if (resp.status === 200) {
        props.triggerRefresh();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault(); // Prevent a new line in the textarea
      validateDatasource(path); // Submit the form
    }
  };

  return (
    <div className={styles.container}>
      <div>
        <h4>{props.id ? "Update a datasource" : "Add a datasouirce"}</h4>

        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            validateDatasource(path);
          }}
        >
          <input type="text" placeholder="type" value={"prometheus"} />
          <input
            type="text"
            placeholder="name"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            value={name}
          />
          <input
            type="text"
            placeholder="url"
            onChange={(e) => setPath(e.target.value)}
            onKeyDown={handleKeyDown}
            value={path}
          />
          <input
            type={authVis}
            placeholder="authentication"
            onClick={() => {
              setAuth("");
              setAuthVis("text");
            }}
            onKeyDown={handleKeyDown}
            onChange={(e) => setAuth(e.target.value)}
            value={auth}
          />
        </form>
        <button
          type="submit"
          onClick={() => validateDatasource(path)}
          className={styles.btn}
          style={{ backgroundColor: btnColor }}
        >
          save
        </button>
        {props.id && (
          <button
            className={`${styles.btn} ${styles.delete}`}
            onClick={() => deleteDatasource(String(props.id))}
          >
            delete
          </button>
        )}
      </div>
    </div>
  );
}
