import axios from "axios";

export const handleUploadFile = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post<string>("url", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};

export const startPolling = async (id: string, handler: any): Promise<void> => {
  const ms = 5000;

  const poll = async (): Promise<void> => {
    try {
      const response = await axios.get<{ status: string; data?: any }>(
        `/api/resource/${id}`
      );

      if (response.data.status === "completed") {
        handler(response.data.data);
        return;
      }

      setTimeout(poll, ms);
    } catch (error) {
      console.error("Error during polling:", error);
      setTimeout(poll, ms);
    }
  };

  poll();
};
