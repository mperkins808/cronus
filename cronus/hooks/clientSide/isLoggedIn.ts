import Cookies from "js-cookie";
import jwtDecode from "jwt-decode";

interface TOK {
  username?: string;
  role?: string;
  exp?: number;
}

export default function isLoggedIn() {
  const cronusCookie = Cookies.get("cronussession");
  if (!cronusCookie) return false;

  let decode: TOK = {};

  try {
    decode = jwtDecode(cronusCookie);
  } catch (error) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  if (now > decode.exp!) return false;

  return decode;
}
