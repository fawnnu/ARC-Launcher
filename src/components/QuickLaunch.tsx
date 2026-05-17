import { useEffect } from "react";
import { FaPlay } from "react-icons/fa";
import { invoke } from "@tauri-apps/api/core";
import { useLibraryStore } from "../stores/libraryStore";
import "./QuickLaunch.css";

function QuickLaunch() {
  const { installed, installPath, icon, setInstalled } = useLibraryStore();

  useEffect(() => {
    if (installed && installPath && !icon) {
      invoke<{ icon: string | null }>("detect_build_version", { path: installPath }).then((info) => {
        if (info.icon) {
          setInstalled(installPath, info.icon);
        }
      });
    }
  }, [installed, installPath, icon]);

  return (
    <div className={`quick-launch ${installed ? "visible" : "hidden"}`}>
      {icon ? (
        <img className="quick-launch-icon-img" src={icon} alt="icon" />
      ) : (
        <div className="quick-launch-icon" />
      )}
      <div className="quick-launch-info">
        <span className="quick-launch-name">Fortnite</span>
        <span className="quick-launch-version">4.2-CL-4072250</span>
      </div>
      <button className="quick-launch-play">
        <FaPlay />
      </button>
    </div>
  );
}

export default QuickLaunch;
