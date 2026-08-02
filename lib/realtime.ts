import * as signalR from "@microsoft/signalr";
import { getAccessToken, getApiUrl } from "@/lib/api";

export function subscribeToTimeEntryChanges(onChange: () => void) {
  const token = getAccessToken();
  if (!token) return () => undefined;

  const hubUrl = getApiUrl().replace(/\/api\/?$/, "/hubs/attendance");
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, { accessTokenFactory: () => token, withCredentials: false })
    .withAutomaticReconnect()
    // Expected React development cleanup can stop start() during negotiation.
    // Handle failures below so that cancellation is not reported as a console error.
    .configureLogging(signalR.LogLevel.None)
    .build();

  let disposed = false;
  connection.on("TimeEntryRequestChanged", onChange);
  void connection.start().catch((error) => {
    if (!disposed) console.warn("Realtime connection unavailable", error);
  });

  return () => {
    disposed = true;
    connection.off("TimeEntryRequestChanged", onChange);
    void connection.stop();
  };
}
