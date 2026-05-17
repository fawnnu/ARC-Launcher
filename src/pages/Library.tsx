import { useState, useRef, useEffect } from "react";
import { IoClose, IoShareOutline, IoFolderOpen, IoCheckmarkCircle } from "react-icons/io5";
import { openUrl, revealItemInDir } from "@tauri-apps/plugin-opener";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { useLibraryStore } from "../stores/libraryStore";
import { useSettingsStore } from "../stores/settingsStore";
import { t } from "../i18n";
import splashImage from "../assets/splash/C1S4.png";
import "./Library.css";

interface BuildInfo {
  version: string;
  cl: string;
  exe_path: string;
  icon: string | null;
  valid: boolean;
  error: string | null;
}

function Library() {
  const { installed, setInstalled, uninstall } = useLibraryStore();
  const locale = useSettingsStore((s) => s.locale);
  const [modal, setModal] = useState<"none" | "choice" | "download" | "import" | "verifying" | "result" | "uninstall">("none");
  const [importPath, setImportPath] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [buildInfo, setBuildInfo] = useState<BuildInfo | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const contextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (contextRef.current && !contextRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleContextMenu(e: React.MouseEvent) {
    if (!installed) return;
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }

  function handleDownload() {
    setModal("download");
  }

  function handleImport() {
    setImportPath(null);
    setImportError(null);
    setBuildInfo(null);
    setModal("import");
  }

  function handleProceed() {
    openUrl("https://builds.rebootfn.org/4.2.zip");
    setModal("none");
  }

  async function handleBrowse() {
    const selected = await open({ directory: true, multiple: false });
    if (!selected) return;
    const path = selected as string;
    const valid = await invoke<boolean>("validate_build_folder", { path });
    if (valid) {
      setImportPath(path);
      setImportError(null);
    } else {
      setImportPath(null);
      setImportError(t("library.import_error_folders", locale));
    }
  }

  async function handleImportConfirm() {
    if (!importPath) return;
    setModal("verifying");
    try {
      const info = await invoke<BuildInfo>("detect_build_version", { path: importPath });
      if (!info.valid) {
        setBuildInfo({ ...info, error: t("library.import_failed_version", locale) });
        setModal("result");
        return;
      }
      const verify = await invoke<{
        passed: boolean;
        files_checked: number;
        unexpected_files: string[];
        missing_files: string[];
        paks_path: string;
        error: string | null;
      }>("verify_build_integrity", { path: importPath });
      if (!verify.passed) {
        if (verify.unexpected_files.length > 0) {
          setBuildInfo({
            version: "",
            cl: "",
            exe_path: "",
            icon: null,
            valid: false,
            error: `__paks__${JSON.stringify({ unexpected: verify.unexpected_files, missing: verify.missing_files, paksPath: verify.paks_path })}`,
          });
        } else {
          setBuildInfo({
            version: "",
            cl: "",
            exe_path: "",
            icon: null,
            valid: false,
            error: verify.error || t("library.failed_verify", locale),
          });
        }
        setModal("result");
        return;
      }
      setBuildInfo(info);
      setModal("result");
    } catch {
      setBuildInfo({
        version: "",
        cl: "",
        exe_path: "",
        icon: null,
        valid: false,
        error: t("library.failed_verify", locale),
      });
      setModal("result");
    }
  }

  function handleConfirmImport() {
    if (importPath && buildInfo) {
      setInstalled(importPath, buildInfo.icon);
    }
    setModal("none");
  }

  function handleUninstall() {
    setContextMenu(null);
    setModal("uninstall");
  }

  function handleVerify() {
    setContextMenu(null);
    handleImport();
  }

  function confirmUninstall() {
    uninstall();
    setModal("none");
  }

  return (
    <>
      <div className="page library">
        <div
          className="build-card"
          onClick={() => !installed && setModal("choice")}
          onContextMenu={handleContextMenu}
        >
          <div className="build-card-image">
            <img src={splashImage} alt="Fortnite" />
          </div>
          <div className="build-card-body">
            <div className="build-card-header">
              <span className="build-card-title">Fortnite</span>
              <span className="build-card-tag">{t("library.public", locale)}</span>
            </div>
            <span className="build-card-version">4.2-CL-4072250</span>
            <span className={`build-card-status ${installed ? "installed" : ""}`}>
              {installed ? t("library.installed", locale) : t("library.not_installed", locale)}
            </span>
          </div>
        </div>
        {contextMenu && (
          <div
            ref={contextRef}
            className="build-context-menu"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <div className="build-context-item" onClick={handleVerify}>{t("library.verify", locale)}</div>
            <div className="build-context-item build-context-danger" onClick={handleUninstall}>{t("library.uninstall", locale)}</div>
          </div>
        )}
      </div>
      {modal === "uninstall" && (
        <div className="modal-overlay" onClick={() => setModal("none")}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal("none")}>
              <IoClose />
            </button>
            <span className="modal-title">{t("library.uninstall_title", locale)}</span>
            <span className="modal-desc">{t("library.uninstall_desc", locale)}</span>
            <div className="modal-actions modal-actions-right">
              <button className="modal-btn-text" onClick={() => setModal("none")}>{t("library.cancel", locale)}</button>
              <button className="modal-btn modal-btn-sm" onClick={confirmUninstall}>{t("library.uninstall", locale)}</button>
            </div>
          </div>
        </div>
      )}
      {modal === "choice" && (
        <div className="modal-overlay" onClick={() => setModal("none")}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal("none")}>
              <IoClose />
            </button>
            <span className="modal-title">{t("library.choice_title", locale)}</span>
            <div className="modal-actions">
              <button className="modal-btn" onClick={handleImport}>{t("library.import", locale)}</button>
              <button className="modal-btn" onClick={handleDownload}>{t("library.download", locale)}</button>
            </div>
          </div>
        </div>
      )}
      {modal === "download" && (
        <div className="modal-overlay" onClick={() => setModal("none")}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal("none")}>
              <IoClose />
            </button>
            <span className="modal-title">{t("library.open_browser", locale)}</span>
            <div className="modal-link">
              <IoShareOutline className="modal-link-icon" />
              <span>https://builds.rebootfn.org/4.2.zip</span>
            </div>
            <div className="modal-actions modal-actions-right">
              <button className="modal-btn-text" onClick={() => setModal("none")}>{t("library.cancel", locale)}</button>
              <button className="modal-btn modal-btn-sm" onClick={handleProceed}>{t("library.proceed", locale)}</button>
            </div>
          </div>
        </div>
      )}
      {modal === "import" && (
        <div className="modal-overlay" onClick={() => setModal("none")}>
          <div className="modal-import-wrapper" onClick={(e) => e.stopPropagation()}>
            <div className="modal modal-import">
              <button className="modal-close" onClick={() => setModal("none")}>
                <IoClose />
              </button>
              <span className="modal-title">{t("library.import_title", locale)}</span>
              <span className="modal-desc">
                {t("library.import_desc_prefix", locale)} <code className="folder-badge"><IoFolderOpen /> Engine</code> {t("library.import_desc_and", locale)} <code className="folder-badge"><IoFolderOpen /> FortniteGame</code>
              </span>
              <button className="import-browse" onClick={handleBrowse}>
                <IoFolderOpen />
                <span>{t("library.browse", locale)}</span>
              </button>
              {importPath && (
                <div className="import-path">{importPath}</div>
              )}
              {importError && (
                <div className="import-error">{importError}</div>
              )}
              <div className="modal-actions modal-actions-right">
                <button className="modal-btn-text" onClick={() => setModal("none")}>{t("library.cancel", locale)}</button>
                <button
                  className="modal-btn modal-btn-sm"
                  onClick={handleImportConfirm}
                  disabled={!importPath}
                >
                  {t("library.proceed", locale)}
                </button>
              </div>
            </div>
            <div className="import-help">
              <span className="import-help-title">{t("library.help_title", locale)}</span>
              <span className="import-help-desc">{t("library.help_desc", locale)}</span>
              <div className="import-help-folders">
                <div className="import-help-folder">Engine/</div>
                <div className="import-help-folder">FortniteGame/</div>
              </div>
            </div>
          </div>
        </div>
      )}
      {modal === "verifying" && (
        <div className="modal-overlay">
          <div className="modal">
            <span className="modal-title">{t("library.verifying", locale)}</span>
            <div className="verifying-spinner" />
          </div>
        </div>
      )}
      {modal === "result" && buildInfo && (
        <div className="modal-overlay" onClick={() => setModal("none")}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal("none")}>
              <IoClose />
            </button>
            {buildInfo.valid ? (
              <>
                <div className="result-header">
                  <span className="modal-title">{t("library.build_found", locale)}</span>
                  <IoCheckmarkCircle className="result-icon-success" />
                </div>
                <div className="result-info">
                  {buildInfo.icon && <img className="result-icon-img" src={buildInfo.icon} alt="icon" />}
                  <div className="result-details">
                    <span className="result-name">Fortnite</span>
                    <span className="result-version">{buildInfo.version}-CL-{buildInfo.cl}</span>
                  </div>
                </div>
                <div className="modal-actions modal-actions-right">
                  <button className="modal-btn-text" onClick={() => setModal("none")}>{t("library.cancel", locale)}</button>
                  <button className="modal-btn modal-btn-sm" onClick={handleConfirmImport}>{t("library.import", locale)}</button>
                </div>
              </>
            ) : (
              <>
                <span className="modal-title">{t("library.import_failed", locale)}</span>
                {buildInfo.error?.startsWith("__paks__") ? (
                  (() => {
                    const data = JSON.parse(buildInfo.error!.replace("__paks__", ""));
                    return (
                      <>
                        <span className="modal-desc">
                          {t("library.paks_remove", locale)} <code className="folder-badge"><IoFolderOpen /> Content/Paks</code>
                        </span>
                        <div className="pak-file-list">
                          {data.unexpected.map((f: string) => (
                            <div className="pak-file-item" key={f}>{f}</div>
                          ))}
                        </div>
                        {data.missing.length > 0 && (
                          <>
                            <span className="modal-desc">{t("library.paks_missing", locale)}</span>
                            <div className="pak-file-list">
                              {data.missing.map((f: string) => (
                                <div className="pak-file-item pak-file-missing" key={f}>{f}</div>
                              ))}
                            </div>
                          </>
                        )}
                        <div className="modal-actions modal-actions-right">
                          <button className="modal-btn-text" onClick={() => setModal("none")}>{t("library.close", locale)}</button>
                          <button className="modal-btn modal-btn-sm" onClick={() => revealItemInDir(data.paksPath)}>{t("library.open_folder", locale)}</button>
                        </div>
                      </>
                    );
                  })()
                ) : (
                  <>
                    <span className="import-error">{buildInfo.error}</span>
                    <div className="modal-actions modal-actions-right">
                      <button className="modal-btn modal-btn-sm" onClick={() => setModal("none")}>{t("library.close", locale)}</button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Library;
