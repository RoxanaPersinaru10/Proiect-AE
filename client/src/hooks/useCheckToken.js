import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCheckTokenLoading, setLoggedIn, setToken } from "../store/slices/globalSlice";
import { getApiUrl } from "../utils/envUtils";

function useCheckToken() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      fetch(`${getApiUrl()}/auth/check`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            dispatch(setLoggedIn(true));
            dispatch(setToken(token));
          } else {
            localStorage.removeItem("token");
            dispatch(setLoggedIn(false));
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          dispatch(setLoggedIn(false));
        })
        .finally(() => {
          dispatch(setCheckTokenLoading(false));
        });

    } else {
      dispatch(setCheckTokenLoading(false));
    }
  }, []);
}

export default useCheckToken;
