import { useState } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useSettingsStore } from "../stores/settingsStore";
import { t } from "../i18n";
import "./Login.css";

interface LoginProps {
  onLogin: (remember: boolean) => void;
}

function Login({ onLogin }: LoginProps) {
  const locale = useSettingsStore((s) => s.locale);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSigningIn(true);
    setTimeout(() => onLogin(remember), 1500);
  }

  if (signingIn) {
    return (
      <div className="signing-in">
        <div className="signing-in-spinner" />
        <span className="signing-in-text">{t("login.signing_in", locale)}</span>
      </div>
    );
  }

  return (
    <div className="login page">
      <div className="login-branding">
        <span className="login-app-name">Arc</span>
      </div>
      <div className="login-panel">
        <h2 className="login-title">{t("login.title", locale)}</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            className="login-input"
            type="text"
            placeholder={t("login.username", locale)}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <div className="login-password-wrapper">
            <input
              className="login-input"
              type={showPassword ? "text" : "password"}
              placeholder={t("login.password", locale)}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="login-eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <IoEyeOff /> : <IoEye />}
            </button>
          </div>
          <label className="login-remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>{t("login.remember", locale)}</span>
          </label>
          <button className="login-button" type="submit">{t("login.submit", locale)}</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
