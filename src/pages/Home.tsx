import { useState, useEffect, useRef } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useSettingsStore } from "../stores/settingsStore";
import { t } from "../i18n";
import { useLauncherStream } from "../hooks/useLauncherStream";
import type { PatchNote } from "../api/launcherService";
import "./Home.css";

function getGreetingKey(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "home.greeting_morning";
  if (hour < 18) return "home.greeting_afternoon";
  return "home.greeting_evening";
}

function getFormattedDate(locale: string): string {
  const loc = locale === "de" ? "de-DE" : "en-GB";
  return new Date().toLocaleDateString(loc, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function Home() {
  const locale = useSettingsStore((s) => s.locale);
  const { patchNotes } = useLauncherStream();
  const [selected, setSelected] = useState<PatchNote | null>(null);
  const [updating, setUpdating] = useState(false);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    setUpdating(true);
    const timer = setTimeout(() => setUpdating(false), 600);
    return () => clearTimeout(timer);
  }, [patchNotes]);

  if (selected) {
    const current = patchNotes.find((p) => p.id === selected.id) ?? selected;

    return (
      <>
        <button className="article-back" onClick={() => setSelected(null)}>
          <IoArrowBack />
          <span>{t("article.back", locale)}</span>
        </button>
        <div className="page home" key="article">
          {updating ? (
            <div className="article-loading">
              <div className="article-spinner" />
            </div>
          ) : (
            <div className="article">
              <div className="article-header">
                <span className="article-version">v{current.version}</span>
                <span className="article-date">{current.date}</span>
              </div>
              <h2 className="article-title">{current.title}</h2>
              <p className="article-summary">{current.summary}</p>
              {current.whatsNew.length > 0 && (
                <div className="article-section">
                  <h3 className="article-section-title">{t("article.whats_new", locale)}</h3>
                  <ul className="article-list">
                    {current.whatsNew.map((item, i) => (
                      <li key={i}>
                        <strong>{item.label}:</strong> {item.detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {current.fixes.length > 0 && (
                <div className="article-section">
                  <h3 className="article-section-title">{t("article.bug_fixes", locale)}</h3>
                  <ul className="article-fixes">
                    {current.fixes.map((fix, i) => (
                      <li key={i}>{fix}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <div className="page home" key="grid">
      <div className="greeting-card">
        <div className="greeting-info">
          <span className="greeting-text">
            {t(getGreetingKey(), locale).replace("{user}", "user")}
          </span>
          <span className="greeting-date">{getFormattedDate(locale)}</span>
        </div>
      </div>
      <div className="home-heading-row">
        <h2 className="home-heading">{t("home.patch_notes", locale)}</h2>
        {(updating || patchNotes.length === 0) && (
          <div className="home-heading-spinner" />
        )}
      </div>
      {!updating && (
        <div className="patch-grid">
          {patchNotes.map((patch) => (
            <div className="patch-card" key={patch.id} onClick={() => setSelected(patch)}>
              <span className="patch-card-version">v{patch.version}</span>
              <span className="patch-card-title">{patch.title}</span>
              <span className="patch-card-date">{patch.date}</span>
              <span className="patch-card-summary">{patch.summary}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
