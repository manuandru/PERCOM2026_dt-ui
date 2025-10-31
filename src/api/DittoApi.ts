import { EventSourcePlus } from "event-source-plus";

class DittoApi {
  static DITTO_BASE =
    import.meta.env.VITE_DITTO_BASE || "http://localhost:8080";
  static AUTH_TOKEN: string = import.meta.env.VITE_AUTH_TOKEN || "";

  static async getThings(): Promise<Array<Record<string, unknown>>> {
    try {
      const response = await fetch(`${DittoApi.DITTO_BASE}/api/2/things`, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Basic ${DittoApi.AUTH_TOKEN}`,
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  }

  static eventSource = new EventSourcePlus(
    `${DittoApi.DITTO_BASE}/api/2/things`,
    {
      method: "get",
      headers: {
        Authorization: `Basic ${DittoApi.AUTH_TOKEN}`,
      },
    }
  );
}

export default DittoApi;
