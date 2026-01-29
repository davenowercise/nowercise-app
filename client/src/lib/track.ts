type EventName = 
  | "screen_view" 
  | "cta_click" 
  | "session_started" 
  | "session_completed" 
  | "post_session_feedback";

export async function track(eventName: EventName, props: Record<string, any> = {}): Promise<void> {
  try {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventName, props }),
    });
  } catch {
    // fail silently - analytics must never break UX
  }
}
