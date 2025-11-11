import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCheckTokenLoading, setLoggedIn, setToken } from "../store/slices/globalSlice";
import { getApiUrl } from "../utils/envUtils";

function useCheckToken() {
  const dispatch = useDispatch();

  useEffect(() => {
  const token = localStorage.getItem("token");
  console.log("Token din localStorage:", token);

  if (token) {
    fetch(`${getApiUrl()}/auth/check`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((res) => {
        console.log("Răspuns /auth/check:", res);
        if (res.success) {
          dispatch(setLoggedIn(true));
          dispatch(setToken(token));
        } else {
          localStorage.removeItem("token");
          dispatch(setLoggedIn(false));
        }
      })
      .catch((err) => {
        console.error("Eroare check token:", err);
        localStorage.removeItem("token");
        dispatch(setLoggedIn(false));
      })
      .finally(() => dispatch(setCheckTokenLoading(false)));
  } else {
    dispatch(setCheckTokenLoading(false));
  }
  }, []);


}

export default useCheckToken;
