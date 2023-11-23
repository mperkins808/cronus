import axios from "axios";
export const fetchDevices = async () => {
  try {
    const resp = await axios.get("/api/users?role=mobile");
    if (resp.status !== 200) {
      return undefined;
    }
    return resp.data;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
