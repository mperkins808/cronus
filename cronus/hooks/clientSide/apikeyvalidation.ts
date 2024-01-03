import axios from "axios";

export async function checkAPIKeyInDB() {
  try {
    const resp = await axios.get(`/api/apikey`);
    if (resp.status !== 200) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}
