import * as signalR from "@microsoft/signalr";
import { getAccessToken, getApiUrl } from "@/lib/api";

export function subscribeToTimeEntryChanges(onChange: () => void) {
  const token = getAccessToken();
  if (!token) return () => undefined;

  const hubUrl = getApiUrl().replace(/\/api\/?$/, "/hubs/attendance");
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, { accessTokenFactory: () => token, withCredentials: false })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  connection.on("TimeEntryRequestChanged", onChange);
  void connection.start().catch((error) => {
    console.warn("Realtime connection unavailable", error);
  });

  return () => {
    connection.off("TimeEntryRequestChanged", onChange);
    void connection.stop();
  };
}
