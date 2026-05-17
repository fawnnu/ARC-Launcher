import { createPortal } from "react-dom";
import { IoConstruct, IoClose } from "react-icons/io5";
import { useSettingsStore } from "../stores/settingsStore";
import { t } from "../i18n";
import type { ServiceStatus } from "../api/launcherService";
import "./Maintenance.css";

interface Props {
  status: ServiceStatus;
  kicked: boolean;
  onDismissKicked: () => void;
}

function Maintenance({ status, kicked, onDismissKicked }: Props) {
  const locale = useSettingsStore((s) => s.locale);

  return (
    <div className="maintenance">
      <IoConstruct className="maintenance-icon" />
      <h2 className="maintenance-title">{t("maintenance.title", locale)}</h2>
      <p className="maintenance-message">{status.message}</p>
      {status.eta && (
        <span className="maintenance-eta">
          {t("maintenance.eta", locale).replace("{eta}", status.eta)}
        </span>
      )}
      {kicked && createPortal(
        <div className="modal-overlay" onClick={onDismissKicked}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={onDismissKicked}>
              <IoClose />
            </button>
            <span className="modal-title">{t("maintenance.kicked_title", locale)}</span>
            <span className="modal-desc">{t("maintenance.kicked_desc", locale)}</span>
            <div className="modal-actions modal-actions-right">
              <button className="modal-btn modal-btn-sm" onClick={onDismissKicked}>
                {t("maintenance.ok", locale)}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default Maintenance;
