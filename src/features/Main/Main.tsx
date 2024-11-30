import { useRef, useState } from "react";
import { Button, InputNumber, notification } from "antd";
import Logo from "../../assets/evrazlogo.png";
import { handleUploadFile } from "../../api";
import "./Main.css";
import { IRequestResponse } from "./types";
import { DotLoader } from "react-spinners";

export const Main = () => {
  const [api, contextHolder] = notification.useNotification();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [requestResponse, setRequestResponse] =
    useState<IRequestResponse | null>(null);
  const [isDataSended, setDataSended] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [timeout, setRequestTimeout] = useState(15);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;

    if (fileList && fileList.length !== 0) {
      if (
        fileList.length === 1 &&
        fileList[0].type === "application/x-zip-compressed"
      ) {
        setSelectedFiles([fileList[0]]);
      } else if (fileList.length >= 1) {
        const filesArray: File[] = [];
        let dotNetFilesCount = 0;

        Object.keys(fileList).forEach((file: string) => {
          if (fileList[Number(file)].name.endsWith(".cs")) {
            filesArray.push(fileList[Number(file)]);
            dotNetFilesCount++;
          }
        });

        setSelectedFiles(filesArray);

        if (dotNetFilesCount === 0) {
          return api.error({
            message: `Ошибка!`,
            description: "Для мультивыбора доступны только файлы C#.",
            placement: "topLeft",
          });
        }

        if (dotNetFilesCount !== fileList.length) {
          return api.warning({
            message: `Осторожно!`,
            description:
              "Для мультивыбора доступны только файлы C#, файлы других типов не были выбраны.",
            placement: "topLeft",
          });
        }
      } else {
        return api.error({
          message: `Ошибка!`,
          description:
            "Выбрать можно либо один .zip файл, либо несколько .cs файлов.",
          placement: "topLeft",
        });
      }
    }
  };

  const handleUploadClick = async () => {
    if (selectedFiles) {
      const pollingHandler = (data: IRequestResponse | null) => {
        setRequestResponse(data);
      };

      setDataSended(true);
      await handleUploadFile(selectedFiles, timeout, pollingHandler);
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
    <div className="main">
      {contextHolder}

      <div className="header">
        <img src={Logo} className="header__logo" alt="logo" />

        {selectedFiles.length > 0 && (
          <div className="file__name">
            {selectedFiles.map((itemFile) => (
              <p>{itemFile.name}</p>
            ))}
          </div>
        )}

        <span className="buttons__block">
          {selectedFiles.length > 0 && !isDataSended && (
            <div className="timeout__block">
              <span>Таймаут запроса в минутах: </span>
              <InputNumber
                className="input__number"
                min={5}
                value={timeout}
                max={60}
                onChange={(value) => setRequestTimeout(value || 15)}
              ></InputNumber>
            </div>
          )}

          {selectedFiles.length === 0 && (
            <Button
              className="button"
              onClick={() => {
                (
                  document.querySelector("#upload-zip") as HTMLButtonElement
                )?.click();
              }}
            >
              Загрузить
            </Button>
          )}

          {selectedFiles.length > 0 && !isDataSended && (
            <Button className="button" onClick={handleUploadClick}>
              Отправить
            </Button>
          )}

          {isDataSended && <DotLoader color="#F57F29" />}

          {selectedFiles.length > 0 && !isDataSended && (
            <Button
              className="button"
              onClick={() => {
                if (inputRef && inputRef.current) {
                  inputRef.current.value = "";
                  (
                    document.querySelector("#upload-zip") as HTMLButtonElement
                  )?.click();
                }
              }}
            >
              Перевыбрать
            </Button>
          )}

          {requestResponse && (
            <Button className="button" onClick={handleDownloadResult}>
              Скачать
            </Button>
          )}
        </span>
      </div>

      {requestResponse && requestResponse.pdf && (
        <iframe
          className="pdf__iframe"
          title="Просмотр PDF документа"
          src={URL.createObjectURL(
            new Blob([requestResponse.pdf], { type: "application/pdf" })
          )}
        ></iframe>
      )}

      <input
        type="file"
        className="file__input"
        onChange={handleFileChange}
        id="upload-zip"
        multiple
        ref={inputRef}
      />
    </div>
  );
};
