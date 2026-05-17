import { useState, useRef, useEffect } from "react";
import { IoChevronDown } from "react-icons/io5";
import { useSettingsStore } from "../stores/settingsStore";
import { t } from "../i18n";
import "./Settings.css";

const sections = ["app", "game"] as const;

const languages = [
  { value: "en-GB" as const, label: "English (UK)" },
  { value: "de" as const, label: "Deutsch (German)" },
];

function Settings() {
  const { locale, setLocale, animatedBg, setAnimatedBg } = useSettingsStore();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const active = "app";

  const currentLabel = languages.find((l) => l.value === locale)?.label ?? "";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="page settings">
      <div className="settings-sidebar">
        {sections.map((section) => (
          <div
            key={section}
            className={`settings-sidebar-item ${active === section ? "active" : ""}`}
          >
            {t(`settings.${section}`, locale)}
          </div>
        ))}
      </div>
      <div className="settings-content">
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="settings-card-title">{t("settings.language", locale)}</span>
          </div>
          <div className="dropdown" ref={dropdownRef}>
            <div className="dropdown-trigger" onClick={() => setOpen(!open)}>
              <span>{currentLabel}</span>
              <IoChevronDown className={`dropdown-icon ${open ? "open" : ""}`} />
            </div>
            {open && (
              <div className="dropdown-menu">
                {languages.map((lang) => (
                  <div
                    key={lang.value}
                    className={`dropdown-item ${locale === lang.value ? "active" : ""}`}
                    onClick={() => {
                      setLocale(lang.value);
                      setOpen(false);
                    }}
                  >
                    {lang.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="settings-card-title">{t("settings.animated_bg", locale)}</span>
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={animatedBg}
              onChange={(e) => setAnimatedBg(e.target.checked)}
            />
            <span className="settings-toggle-label">{t("settings.animated_bg_label", locale)}</span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default Settings;
