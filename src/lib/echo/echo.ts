import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Hacer Pusher disponible globalmente — requerido por Laravel Echo
(window as any).Pusher = Pusher;

let echoInstance: Echo<"reverb"> | null = null;

// Singleton — una sola conexión por sesión
export function getEcho(token: string): Echo<"reverb"> {
  if (echoInstance) return echoInstance;

  echoInstance = new Echo({
    broadcaster:   "reverb",
    key:           process.env.NEXT_PUBLIC_REVERB_APP_KEY!,
    wsHost:        process.env.NEXT_PUBLIC_REVERB_HOST ?? "localhost",
    wsPort:        parseInt(process.env.NEXT_PUBLIC_REVERB_PORT ?? "8080"),
    wssPort:       parseInt(process.env.NEXT_PUBLIC_REVERB_PORT ?? "8080"),
    forceTLS:      process.env.NEXT_PUBLIC_REVERB_SCHEME === "https",
    enabledTransports: ["ws", "wss"],
    // Auth para canales privados
    authEndpoint:  `${process.env.NEXT_PUBLIC_API_URL}broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        "company-id":  localStorage.getItem("companyId") ?? "1",
      },
    },
  });

  return echoInstance;
}

// Desconectar al hacer logout
export function disconnectEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}