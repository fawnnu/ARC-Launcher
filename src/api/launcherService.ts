const BASE_URL = "http://localhost:3200/api";

export interface PatchNote {
  id: string;
  version: string;
  date: string;
  title: string;
  summary: string;
  whatsNew: { label: string; detail: string }[];
  fixes: string[];
}

export interface ServiceStatus {
  maintenance: boolean;
  message: string;
  eta: string | null;
}

export interface StreamData {
  status: ServiceStatus;
  patchNotes: PatchNote[];
}

type StreamListener = (data: StreamData) => void;

let currentData: StreamData = {
  status: { maintenance: false, message: "", eta: null },
  patchNotes: [],
};

const listeners = new Set<StreamListener>();
let eventSource: EventSource | null = null;

function notify(): void {
  for (const listener of listeners) {
    listener(currentData);
  }
}

export function connectStream(): void {
  if (eventSource) return;

  eventSource = new EventSource(`${BASE_URL}/stream`);

  eventSource.addEventListener("init", (e) => {
    const payload = JSON.parse(e.data);
    currentData = {
      status: payload.status,
      patchNotes: payload.patchNotes,
    };
    notify();
  });

  eventSource.addEventListener("status", (e) => {
    currentData = { ...currentData, status: JSON.parse(e.data) };
    notify();
  });

  eventSource.addEventListener("patchNotes", (e) => {
    currentData = { ...currentData, patchNotes: JSON.parse(e.data) };
    notify();
  });

  eventSource.onerror = () => {
    eventSource?.close();
    eventSource = null;
    setTimeout(connectStream, 3000);
  };
}

export function disconnectStream(): void {
  eventSource?.close();
  eventSource = null;
}

export function subscribe(listener: StreamListener): () => void {
  listeners.add(listener);
  listener(currentData);
  return () => listeners.delete(listener);
}

export function getStreamData(): StreamData {
  return currentData;
}
