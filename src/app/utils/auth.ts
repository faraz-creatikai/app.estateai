import Cookies from "js-cookie";
export const getAuthToken = (): string | null => {
   
  const session = localStorage.getItem("session");
  if (!session) return null;

  const { token, expiry } = JSON.parse(session);
  if (Date.now() > expiry) {
    localStorage.removeItem("session");
    return null; // expired
  }

  return token;
};

export const logout = () => {
  localStorage.removeItem("session");
  Cookies.remove("token");
   
};
