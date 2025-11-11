import { getApiUrl } from "../utils/envUtils";

export const loginUser = async (email, password) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  };

  const result = await fetch(`${getApiUrl()}/auth/login`, options);
  const response = await result.json();
  return response;
};