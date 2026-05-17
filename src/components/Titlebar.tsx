import { getCurrentWindow } from "@tauri-apps/api/window";
import { VscChromeMinimize, VscChromeClose } from "react-icons/vsc";
import { useSettingsStore } from "../stores/settingsStore";
import { t } from "../i18n";
import "./Titlebar.css";

declare const __APP_VERSION__: string;

const version = __APP_VERSION__;
const env = import.meta.env.MODE === "production" ? "prod" : "dev";

const pageKeys: Record<string, string> = {
  home: "nav.home",
  library: "nav.library",
  shop: "nav.shop",
  settings: "nav.settings",
};

interface TitlebarProps {
  page?: string;
}

function Titlebar({ page }: TitlebarProps) {
  const appWindow = getCurrentWindow();
  const locale = useSettingsStore((s) => s.locale);
  const pageName = page ? t(pageKeys[page] || "", locale) : "";

  return (
    <div data-tauri-drag-region className="titlebar">
      <div data-tauri-drag-region className="titlebar-info">
        <span data-tauri-drag-region className="titlebar-title">Arc</span>
        <span data-tauri-drag-region className="titlebar-meta">
          {version} • {env}{pageName && ` • ${pageName}`}
        </span>
      </div>
      <div className="titlebar-buttons">
        <button className="titlebar-button" onClick={() => appWindow.minimize()}>
          <VscChromeMinimize />
        </button>
        <button className="titlebar-button titlebar-button-close" onClick={() => appWindow.close()}>
          <VscChromeClose />
        </button>
      </div>
    </div>
  );
}

export default Titlebar;
