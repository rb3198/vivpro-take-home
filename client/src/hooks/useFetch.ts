import { useCallback, useState } from "react";

export const useFetch = <T>() => {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>();

  const fetchResource = useCallback(
    async (url: string, method: "get" | "patch", body?: BodyInit) => {
      setLoading(true);
      try {
        const res = await fetch(url, {
          method,
          body,
        });
        setData(await res.json());
        setLoading(false);
      } catch (error) {
        setError(error);
      }
    },
    []
  );

  return { fetch: fetchResource, loading, data, error };
};
