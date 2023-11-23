import axios from "axios";
export const fetchDatasources = async () => {
    try {
      const resp = await axios.get("/api/datasource");
      if (resp.status !== 200) {
        return undefined;
      }
      return resp.data;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  };