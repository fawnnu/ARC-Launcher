import { useState, useEffect, useRef } from "react";
import Titlebar from "./components/Titlebar";
import Navbar from "./components/Navbar";
import QuickLaunch from "./components/QuickLaunch";
import Starry from "./components/Starry";
import Splash from "./components/Splash";
import Maintenance from "./components/Maintenance";
import Login from "./components/Login";
import Home from "./pages/Home";
import Library from "./pages/Library";
import Shop from "./pages/Shop";
import Settings from "./pages/Settings";
import { connectStream } from "./api/launcherService";
import { useLauncherStream } from "./hooks/useLauncherStream";
import { useSettingsStore } from "./stores/settingsStore";
import { t } from "./i18n";
import "./App.css";

function isRemembered(): boolean {
  return localStorage.getItem("arc_remember") === "true";
}

function App() {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [page, setPage] = useState("home");
  const [kicked, setKicked] = useState(false);
  const { status } = useLauncherStream();
  const locale = useSettingsStore((s) => s.locale);
  const wasLoggedIn = useRef(false);
  const prevMaintenance = useRef(status.maintenance);

  useEffect(() => {
    connectStream();
    const timer = setTimeout(() => {
      setReady(true);
      if (isRemembered()) {
        setSigningIn(true);
        setTimeout(() => {
          setSigningIn(false);
          setLoggedIn(true);
        }, 1500);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (status.maintenance && wasLoggedIn.current) {
      setLoggedIn(false);
      setKicked(true);
    }
    if (prevMaintenance.current && !status.maintenance) {
      setReady(true);
      if (isRemembered()) {
        setSigningIn(true);
        setTimeout(() => {
          setSigningIn(false);
          setLoggedIn(true);
        }, 1500);
      }
    }
    prevMaintenance.current = status.maintenance;
    wasLoggedIn.current = loggedIn;
  }, [status.maintenance]);

  useEffect(() => {
    wasLoggedIn.current = loggedIn;
  }, [loggedIn]);

  function handleLogin(remember: boolean) {
    if (remember) {
      localStorage.setItem("arc_remember", "true");
    } else {
      localStorage.removeItem("arc_remember");
    }
    setLoggedIn(true);
  }

  function handleSignOut() {
    localStorage.removeItem("arc_remember");
    setLoggedIn(false);
  }

  const showApp = ready && !status.maintenance && loggedIn && !signingIn;

  return (
    <>
      <Starry />
      <Titlebar page={showApp ? page : undefined} />
      {!ready && <Splash />}
      {ready && status.maintenance && (
        <Maintenance status={status} kicked={kicked} onDismissKicked={() => setKicked(false)} />
      )}
      {ready && !status.maintenance && !loggedIn && !signingIn && (
        <Login onLogin={handleLogin} />
      )}
      {ready && !status.maintenance && signingIn && (
        <div className="signing-in">
          <div className="signing-in-spinner" />
          <span className="signing-in-text">{t("login.signing_in", locale)}</span>
        </div>
      )}
      {showApp && (
        <>
          <div className="top-bar">
            <Navbar page={page} setPage={setPage} onSignOut={handleSignOut} />
            <QuickLaunch />
          </div>
          <main className="container">
            {page === "home" && <Home />}
            {page === "library" && <Library />}
            {page === "shop" && <Shop />}
            {page === "settings" && <Settings />}
          </main>
        </>
      )}
    </>
  );
}

export default App;
