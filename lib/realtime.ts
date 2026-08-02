import * as signalR from "@microsoft/signalr";
import { getAccessToken, getApiUrl } from "@/lib/api";

export type RequestChangeKind = "leave" | "time-entry";

export function subscribeToRequestChanges(onChange: (kind: RequestChangeKind) => void) {
  const token = getAccessToken();
  if (!token) return () => undefined;

  const hubUrl = getApiUrl().replace(/\/api\/?$/, "/hubs/attendance");
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, { accessTokenFactory: () => token, withCredentials: false })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.None)
    .build();

  let disposed = false;
  const handleTimeEntry = () => onChange("time-entry");
  const handleLeave = () => onChange("leave");
  connection.on("TimeEntryRequestChanged", handleTimeEntry);
  connection.on("LeaveRequestChanged", handleLeave);
  void connection.start().catch((error) => {
    if (!disposed) console.warn("Realtime connection unavailable", error);
  });

  return () => {
    disposed = true;
    connection.off("TimeEntryRequestChanged", handleTimeEntry);
    connection.off("LeaveRequestChanged", handleLeave);
    void connection.stop();
  };
}

export function subscribeToTimeEntryChanges(onChange: () => void) {
  return subscribeToRequestChanges((kind) => {
    if (kind === "time-entry") onChange();
  });
}