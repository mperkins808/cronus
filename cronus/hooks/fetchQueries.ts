import axios from "axios";
export const fetchQueries = async () => {
    try {
      const resp = await axios.get("/api/storedqueries");
      if (resp.status !== 200) {
        return undefined;
      }
      return resp.data;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  };