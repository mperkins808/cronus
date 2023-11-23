import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import { fetchDatasources } from "@/hooks/fetchDatasources";
import { buildQuery, convertTimeToSteps } from "@/hooks/buildQuery";
import axios from "axios";

interface props {
  id?: string;
  name?: string;
  raw_query?: string;
  step?: string;
  time?: string;
  labelreplacer?: string;
  datasource_id?: string;
  datasource_type?: string;
  triggerRefresh: () => void;
}

interface datasource {
  id: string;
  name: string;
  path: string;
}

interface promDataresp {
  data: {
    resultType: string;
    result: promMetric[];
  };
}

interface promMetric {
  __name__: string;
  instance: string;
  job: string;
  values: [number, string][];
}

function findDS(arr: datasource[], target: string): number {
  for (let i = 0; i < arr.length; i++) {
    if (target === arr[i].id) return i;
  }
  return 0;
}

function findTime(arr: string[], target: string): number {
  for (let i = 0; i < arr.length; i++) {
    if (target === arr[i]) return i;
  }
  return 0;
}

export default function Home(props: props) {
  const [btnColor, setBtnColor] = useState("");
  const [datasources, setDatasources] = useState<[datasource] | undefined>(
    undefined
  );
  const [pulledQueryData, setPulledQueryData] = useState<
    promDataresp | undefined
  >(undefined);
  const [name, setName] = useState(props.name ? props.name : "");
  const [selected, setSelected] = useState(0);
  const [displayDatasources, setDisplayDatasources] = useState(false);
  const [query, setQuery] = useState(props.raw_query ? props.raw_query : "");
  const [labelreplacer, setLabelReplacer] = useState(
    props.labelreplacer ? props.labelreplacer : ""
  );
  const [selectedTime, setSelectedTime] = useState(6);
  const [timeOptions, settimeOptions] = useState([
    "15s",
    "30s",
    "1m",
    "5m",
    "10m",
    "30m",
    "1h",
    "2h",
    "6h",
    "12h",
    "1d",
    "1w",
    "1M",
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  async function makeQueryReq() {
    if (datasources === undefined) {
      return;
    }

    const ds = datasources[selected];

    const Q = buildQuery(
      "prometheus",
      ds.path,
      timeOptions[selectedTime],
      String(convertTimeToSteps(timeOptions[selectedTime])),
      query,
      labelreplacer
    );
    let ok = false;
    try {
      const resp = await axios.get(Q);
      console.log(resp.status);
      if (resp.data.data.result.length === 0) {
        setBtnColor("orange");
      } else {
        setPulledQueryData(resp.data.data.result[0].values);
        ok = true;
        setBtnColor("green");
      }
    } catch (error: any) {
      console.log(error.response.data);
      setBtnColor("red");
    }

    if (!ok) return;

    try {
      const Q = `/api/storedqueries?id=${props.id}&name=${name}&datasource_id=${
        ds.id
      }&step=${String(convertTimeToSteps(timeOptions[selectedTime]))}&time=${
        timeOptions[selectedTime]
      }&datasource_type=prometheus&raw_query=${query}&cronus_label=${labelreplacer}`;
      if (props.id) {
        const saveQResp = await axios.patch(Q);
      } else {
        const saveQResp = await axios.post(Q);
      }
      setBtnColor("green");
      props.triggerRefresh();
    } catch (error: any) {
      console.log(error.response.data);
      setBtnColor("red");
    }
  }

  async function fetchData() {
    console.log("fetching datasources");
    const data = await fetchDatasources();
    if (data !== undefined) {
      if (data.length === 0) {
        const emptyD: datasource = {
          id: "undefined",
          name: "none",
          path: "undefined",
        };
        setDatasources([emptyD]);
      } else {
        setDatasources(data);
        setSelected(
          findDS(data, props.datasource_id ? props.datasource_id : "")
        );

        setSelectedTime(findTime(timeOptions, props.time ? props.time : "1h"));
      }
    }
  }

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // Handle form submission here, e.g., send the textareaValue to a server or perform some action
    console.log("Textarea value:", query);
    makeQueryReq();
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault(); // Prevent a new line in the textarea
      handleSubmit(e); // Submit the form
    }
  };

  const handleDelete = async (i: string) => {
    try {
      const resp = await axios.delete(`/api/storedqueries?id=${props.id}`);
      if (resp.status !== 200) {
        console.error(`unable to delete query ${props.id}`);
        return;
      }
      props.triggerRefresh();
    } catch (error) {
      console.error(error);
    }
  };

  if (datasources === undefined) {
    return <div></div>;
  }

  return (
    <div className={styles.container}>
      <h4>{props.id ? "Update a query" : "Add a query"}</h4>

      <input
        value={name}
        onChange={(e) => {
          setName(e.target.value);
        }}
        className={styles.name}
        placeholder="Name"
      />
      <div className={styles.dsSelectorContainer}>
        <p className={styles.label}>Datasource</p>

        <div className={styles.dsSelector} style={{ marginLeft: "1rem" }}>
          <p
            onClick={() => {
              setDisplayDatasources(!displayDatasources);
            }}
          >
            {datasources[selected].name}
          </p>
          <div style={{ backgroundColor: "black" }}>
            {datasources &&
              displayDatasources &&
              datasources.map((ds, i) => {
                return (
                  <div
                    className={styles.dsSelectorChildren}
                    key={i}
                    onClick={() => {
                      setSelected(i);
                      setDisplayDatasources(!displayDatasources);
                    }}
                  >
                    {ds.name}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className={styles.queryInput}>
        <label>
          <textarea
            value={query}
            onChange={(e) => {
              setBtnColor("");
              setQuery(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            rows={4} // Number of visible rows
            cols={50} // Number of visible columns
          />
        </label>
        <br />
        <input
          className={styles.labelReplacer}
          value={labelreplacer}
          onChange={(e) => setLabelReplacer(e.target.value)}
          placeholder="label replacer"
        />

        <div className={styles.timeselectorContainer}>
          <DropDown
            selected={selectedTime}
            options={timeOptions}
            parseSelected={(i) => setSelectedTime(i)}
          />
          <button
            type="submit"
            style={{ backgroundColor: btnColor }}
            className={styles.saveBtn}
          >
            save
          </button>
        </div>
      </form>

      {props.id && (
        <button
          className={styles.deleteBtn}
          onClick={() => handleDelete(props.id!)}
        >
          delete
        </button>
      )}
    </div>
  );
}

interface dropdown {
  selected: number;
  options: String[];
  parseSelected: (i: number) => void;
}

function DropDown(props: dropdown) {
  const [display, setDisplay] = useState(false);

  return (
    <div className={styles.dsSelector}>
      <p
        onClick={() => {
          setDisplay(!display);
        }}
      >
        {props.options[props.selected]}
      </p>
      <div className={styles.dropdown}>
        {display &&
          props.options.map((t, i) => {
            return (
              <div
                key={i}
                className={styles.dropdownChildren}
                onClick={() => {
                  props.parseSelected(i);
                  setDisplay(!display);
                }}
              >
                {t}
              </div>
            );
          })}
      </div>
    </div>
  );
}
