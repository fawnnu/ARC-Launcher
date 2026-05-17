import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { GoHomeFill } from "react-icons/go";
import { HiShoppingBag } from "react-icons/hi2";
import { IoLibrary, IoSettings, IoClose } from "react-icons/io5";
import { useSettingsStore } from "../stores/settingsStore";
import { t } from "../i18n";
import "./Navbar.css";

interface NavbarProps {
  page: string;
  setPage: (page: string) => void;
  onSignOut: () => void;
}

function Navbar({ page, setPage, onSignOut }: NavbarProps) {
  const locale = useSettingsStore((s) => s.locale);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSignOutClick() {
    setMenuOpen(false);
    setConfirmOpen(true);
  }

  function handleConfirm() {
    setConfirmOpen(false);
    onSignOut();
  }

  return (
    <>
      <nav className="navbar">
        <div
          className={`navbar-item ${page === "home" ? "active" : ""}`}
          onClick={() => setPage("home")}
        >
          <GoHomeFill />
        </div>
        <div
          className={`navbar-item ${page === "library" ? "active" : ""}`}
          onClick={() => setPage("library")}
        >
          <IoLibrary />
        </div>
        <div
          className={`navbar-item ${page === "shop" ? "active" : ""}`}
          onClick={() => setPage("shop")}
        >
          <HiShoppingBag />
        </div>
        <div className="navbar-avatar-wrapper" ref={menuRef}>
          <div className="navbar-avatar" onClick={() => setMenuOpen(!menuOpen)}>
            <img src="https://fortnite-api.com/images/cosmetics/br/cid_884_athena_commando_f_choneramirez/smallicon.png" alt="avatar" />
          </div>
          {menuOpen && (
            <div className="navbar-avatar-menu">
              <div className="navbar-avatar-menu-item" onClick={handleSignOutClick}>
                {t("nav.sign_out", locale)}
              </div>
            </div>
          )}
        </div>
        <div
          className={`navbar-item ${page === "settings" ? "active" : ""}`}
          onClick={() => setPage("settings")}
        >
          <IoSettings />
        </div>
      </nav>
      {confirmOpen && createPortal(
        <div className="modal-overlay" onClick={() => setConfirmOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setConfirmOpen(false)}>
              <IoClose />
            </button>
            <span className="modal-title">{t("nav.sign_out_title", locale)}</span>
            <span className="modal-desc">{t("nav.sign_out_desc", locale)}</span>
            <div className="modal-actions modal-actions-right">
              <button className="modal-btn-text" onClick={() => setConfirmOpen(false)}>
                {t("nav.cancel", locale)}
              </button>
              <button className="modal-btn modal-btn-sm" onClick={handleConfirm}>
                {t("nav.sign_out", locale)}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default Navbar;
