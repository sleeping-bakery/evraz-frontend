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

    const pdfFile = response.data[1];

    const byteCharactersPdf = atob(pdfFile.fileContentBase64);
    const byteNumbersPdf = Array.from(byteCharactersPdf, (char) =>
      char.charCodeAt(0)
    );
    const byteArrayPdf = new Uint8Array(byteNumbersPdf);

    const pdfFileConverted = new File([byteArrayPdf], "REVIEW.pdf", {
      type: "application/octet-stream",
    });

    const mdFile = response.data[0];

    const byteCharactersMd = atob(mdFile.fileContentBase64);
    const byteNumbersMd = Array.from(byteCharactersMd, (char) =>
      char.charCodeAt(0)
    );
    const byteArrayMd = new Uint8Array(byteNumbersMd);

    const mdFileConverted = new File([byteArrayMd], "REVIEW.md", {
      type: "text/markdown;charset=utf-8",
    });

    const responseData = {
      pdf: pdfFileConverted,
      md: mdFileConverted,
    };

    return handler(responseData);
  } catch (error) {
    errorHandler("Попробуйте ещё раз");
  }
};
