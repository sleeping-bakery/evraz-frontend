import React, { useState } from "react";
import { ConfigProvider, Button, Typography } from "antd";
import "./App.css";
import { handleUploadFile, startPolling } from "./api";

function App() {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [pollingResponse, setPollingResponse] = useState<any>(null);
  const [isDataSended, setDataSended] = useState(false);

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];

    console.log(file);

    if (
      file &&
      (file.type === "application/zip" ||
        file.type === "application/x-zip-compressed")
    ) {
      setSelectedFile(file);
    }
  };

  const handleUploadClick = async () => {
    if (selectedFile) {
      const id = await handleUploadFile(selectedFile);

      if (id) {
        const pollingHandler = (data: any) => {
          setPollingResponse(data);
        };

        setDataSended(true);
        await startPolling(id, pollingHandler);
      }
    }
  };

  const handleDownloadResult = async (): Promise<void> => {
    const filePdf = {
      name: "REVIEW.pdf",
      content: new Uint8Array([37, 80, 68, 70, 45, 49, 46, 52]),
    };

    const fileMd = {
      name: "REVIEW.md",
      content: "# This is a Markdown file\n\n- Item 1\n- Item 2\n",
    };

    const downloadFile = (
      fileName: string,
      content: BlobPart,
      mimeType: string
    ): void => {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    downloadFile(filePdf.name, filePdf.content, "application/pdf");
    downloadFile(fileMd.name, fileMd.content, "text/markdown");
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Button: {
            colorPrimary: "red",
            defaultBg: "red",
            defaultBorderColor: "red",
            colorText: "white",
            defaultActiveColor: "red",
            defaultActiveBg: "black",
            defaultActiveBorderColor: "black",
            defaultHoverBg: "black",
            defaultHoverColor: "red",
            defaultHoverBorderColor: "black",
          },
        },
      }}
    >
      <div className="Main">
        <div className="Title">
          <span>/ / </span>
          <h1>ХАКАТОН ЕВРАЗ</h1>
        </div>

        <input
          type="file"
          accept=".zip"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="upload-zip"
        />
        {!selectedFile && (
          <Button
            className="Button"
            onClick={() => {
              (
                document.querySelector("#upload-zip") as HTMLButtonElement
              )?.click();
            }}
          >
            Загрузить файл
          </Button>
        )}

        {selectedFile && (
          <Typography.Title className="FileName">
            {selectedFile.name}
          </Typography.Title>
        )}
        {selectedFile && !isDataSended && (
          <Button className="Button" onClick={handleUploadClick}>
            Отправить
          </Button>
        )}

        {pollingResponse && (
          <Button className="Button" onClick={handleDownloadResult}>
            Скачать
          </Button>
        )}
      </div>
    </ConfigProvider>
  );
}

export default App;
