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

        if (filesArray.length === 0) {
          return api.error({
            message: `Ошибка!`,
            description:
              "Выбрать можно либо один .zip файл, либо несколько .cs файлов.",
            placement: "topLeft",
          });
        }

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
      const requestHandler = (data: IRequestResponse | null) => {
        setRequestResponse(data);
        setSelectedFiles([]);
        setDataSended(false);
        setRequestTimeout(15);
      };

      const errorHandler = (errorMessage: string) => {
        setDataSended(false);

        api.error({
          message: `Ошибка!`,
          description: errorMessage,
          placement: "topLeft",
        });
      };

      setDataSended(true);
      await handleUploadFile(
        selectedFiles,
        timeout,
        requestHandler,
        errorHandler
      );
    }
  };

  const handleDownloadResult = async (): Promise<void> => {
    if (requestResponse) {
      const downloadFile = (file: File): void => {
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      };

      downloadFile(requestResponse.pdf);
      downloadFile(requestResponse.md);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      setRequestResponse(null);
      setSelectedFiles([]);
      setDataSended(false);
      setRequestTimeout(15);
    }
  };

  return (
    <div className="main">
      {contextHolder}

      <div className="header">
        <img src={Logo} className="header__logo" alt="logo" />

        {!requestResponse && selectedFiles.length > 0 && (
          <div className="file__name">
            {selectedFiles.map((itemFile) => (
              <p>{itemFile.name}</p>
            ))}
          </div>
        )}

        <span className="buttons__block">
          {!requestResponse && selectedFiles.length > 0 && !isDataSended && (
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

          {!requestResponse && selectedFiles.length === 0 && (
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

          {!requestResponse && selectedFiles.length > 0 && !isDataSended && (
            <Button className="button" onClick={handleUploadClick}>
              Отправить
            </Button>
          )}

          {!requestResponse && isDataSended && <DotLoader color="#F57F29" />}

          {!requestResponse && selectedFiles.length > 0 && !isDataSended && (
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
