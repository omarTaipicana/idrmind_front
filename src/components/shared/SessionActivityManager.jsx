import { useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const IDLE_MS = 10 * 60 * 1000;
const REFRESH_MS = 4 * 60 * 1000;
const ACTIVITY_KEY = "idrmind.session.lastActivity";
const TOKEN_KEY = "token";

// La actividad solo proviene de interacciones del usuario; las peticiones de fondo no la reinician.
export default function SessionActivityManager() {
  useEffect(() => {
    let lastRefresh = Date.now();
    let refreshing = false;
    let ending = false;
    let lastRecorded = 0;
    const token = () => localStorage.getItem(TOKEN_KEY);

    const endSession = (revoke = true) => {
      if (ending) return;
      ending = true;
      const current = token();
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ACTIVITY_KEY);
      window.dispatchEvent(new Event("idrmind:session-expired"));
      // HashRouter: la ruta real está en location.hash, no en pathname.
      if (window.location.hash !== "#/login") window.location.replace(`${window.location.pathname}${window.location.search}#/login`);
      if (revoke && current) {
        // No retrasar el cierre visual esperando la red.
        void axios.post(`${API}/users/session/logout`, {}, {
          headers: { Authorization: `Bearer ${current}` }, timeout: 4000,
        }).catch(() => {});
      }
    };

    const noteActivity = () => {
      if (!token() || ending) return;
      const now = Date.now();
      const last = Number(localStorage.getItem(ACTIVITY_KEY) || 0);
      // No revivir una sesión ya inactiva por el primer clic después de volver a la pestaña.
      if (last && now - last >= IDLE_MS) { endSession(); return; }
      if (now - lastRecorded >= 15000) {
        localStorage.setItem(ACTIVITY_KEY, String(now));
        lastRecorded = now;
      }
    };

    const check = async () => {
      if (!token() || refreshing || ending) return;
      const now = Date.now();
      const last = Number(localStorage.getItem(ACTIVITY_KEY) || 0);
      if (!last) {
        // Sesión previa sin marca: iniciar ventana de inactividad sin asumir actividad futura.
        localStorage.setItem(ACTIVITY_KEY, String(now));
        return;
      }
      if (now - last >= IDLE_MS) { endSession(); return; }
      if (document.hidden || now - lastRefresh < REFRESH_MS) return;
      refreshing = true;
      const current = token();
      try {
        const response = await axios.post(`${API}/users/session/refresh`, {}, {
          headers: { Authorization: `Bearer ${current}` }, timeout: 8000,
        });
        if (ending) return;
        const latest = Number(localStorage.getItem(ACTIVITY_KEY) || 0);
        if (Date.now() - latest >= IDLE_MS) { endSession(); return; }
        if (token() === current && response.data?.token) {
          localStorage.setItem(TOKEN_KEY, response.data.token);
        }
        lastRefresh = Date.now();
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) endSession(false);
      } finally {
        refreshing = false;
      }
    };

    const onStorage = (event) => {
      if (event.key === TOKEN_KEY && !event.newValue && event.oldValue) endSession(false);
    };
    const onVisibility = () => { if (!document.hidden) void check(); };
    const events = ["pointerdown", "keydown", "touchstart", "scroll"];
    events.forEach((event) => window.addEventListener(event, noteActivity, { passive: true }));
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibility);
    const timer = window.setInterval(() => { void check(); }, 30000);
    void check();
    return () => {
      events.forEach((event) => window.removeEventListener(event, noteActivity));
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(timer);
    };
  }, []);
  return null;
}
