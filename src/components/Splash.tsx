import { useSettingsStore } from "../stores/settingsStore";
import { t } from "../i18n";
import "./Splash.css";

function Splash() {
  const locale = useSettingsStore((s) => s.locale);

  return (
    <div className="splash">
      <div className="splash-spinner" />
      <span className="splash-text">{t("splash.checking", locale)}</span>
    </div>
  );
}

export default Splash;
