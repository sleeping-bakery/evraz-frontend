import axios from "axios";
import { IRequestResponse } from "../features/Main/types";

export const handleUploadFile = async (
  files: File[],
  timeout: number,
  handler: (data: IRequestResponse | null) => void,
  errorHandler: (errorMessage: string) => void
) => {
  try {
    const formData = new FormData();

    files.forEach((file) => formData.append("file", file));

    formData.append("timeout", String(timeout));

    const response = await axios.post<any>(
      "http://178.20.208.4:8080/Review",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const mdFile = await response.data[0];
    const pdfFile = await response.data[1];

    const responseData = {
      pdf: pdfFile,
      md: mdFile,
    };

    return handler(responseData);
  } catch (error) {
    console.log("Error uploading file:", error);
    errorHandler("Попробуйте ещё раз");
  }
};
