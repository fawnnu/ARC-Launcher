import { useState, useEffect } from "react";
import { subscribe, type StreamData } from "../api/launcherService";

export function useLauncherStream(): StreamData {
  const [data, setData] = useState<StreamData>({
    status: { maintenance: false, message: "", eta: null },
    patchNotes: [],
  });

  useEffect(() => {
    return subscribe(setData);
  }, []);

  return data;
}
