import React, { useEffect, useState } from "react";
import { Header } from "../components/Header";
import axios from "axios";
import { useCookies } from "react-cookie";
import { url } from "../const";
import { useNavigate, useParams } from "react-router-dom";
import "./editTask.scss";

export const EditTask = () => {
  const navigate = useNavigate();
  const { listId, taskId } = useParams();
  const [cookies] = useCookies();
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [isDone, setIsDone] = useState(false);
  const [limit, setLimit] = useState(""); // JSTの期限日時
  const [originalLimit, setOriginalLimit] = useState(""); // APIから取得したISO形式の期限
  const [errorMessage, setErrorMessage] = useState("");

  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleDetailChange = (e) => setDetail(e.target.value);
  const handleIsDoneChange = (e) => setIsDone(e.target.value === "done");
  const handleLimitChange = (e) => setLimit(e.target.value);

  const onUpdateTask = () => {
    // 期限が変更されていなければ、そのまま送信
    const formattedLimit = limit === convertToJST(originalLimit) ? originalLimit : convertToUTC(limit);

    const data = {
      title,
      detail,
      done: isDone,
      limit: formattedLimit,
    };

    axios
      .put(`${url}/lists/${listId}/tasks/${taskId}`, data, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then(() => {
        navigate("/");
      })
      .catch((err) => {
        setErrorMessage(`更新に失敗しました。${err}`);
      });
  };

  const onDeleteTask = () => {
    axios
      .delete(`${url}/lists/${listId}/tasks/${taskId}`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then(() => {
        navigate("/");
      })
      .catch((err) => {
        setErrorMessage(`削除に失敗しました。${err}`);
      });
  };

  useEffect(() => {
    axios
      .get(`${url}/lists/${listId}/tasks/${taskId}`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        const task = res.data;
        setTitle(task.title);
        setDetail(task.detail);
        setIsDone(task.done);
        setOriginalLimit(task.limit || ""); // 取得した元のISO形式の期限を保存
        setLimit(task.limit ? convertToJST(task.limit) : ""); // JSTに変換して表示
      })
      .catch((err) => {
        setErrorMessage(`タスク情報の取得に失敗しました。${err}`);
      });
  }, [cookies.token, listId, taskId]);

  const convertToJST = (utcDate) => {
    const date = new Date(utcDate);
    date.setHours(date.getHours() + 9); // UTCからJST（+9時間）に変換
    return date.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm" 形式に変換
  };

  const convertToUTC = (jstDate) => {
    const date = new Date(jstDate);
    date.setHours(date.getHours() - 9); // JSTからUTCに変換
    return date.toISOString();
  };

  const calculateRemainingDateTime = () => {
    if (!limit) return null;

    const limitDate = new Date(limit);
    const now = new Date();
    const timeDiff = limitDate - now;

    if (timeDiff <= 0) return "期限切れ";

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}日 ${hours}時間 ${minutes}分`;
  };

  return (
    <div>
      <Header />
      <main className="edit-task">
        <h2>タスク編集</h2>
        <p className="error-message">{errorMessage}</p>
        <form className="edit-task-form">
          <label>タイトル</label>
          <br />
          <input
            type="text"
            onChange={handleTitleChange}
            className="edit-task-title"
            value={title}
          />
          <br />
          <label>詳細</label>
          <br />
          <textarea
            onChange={handleDetailChange}
            className="edit-task-detail"
            value={detail}
          />
          <br />
          <label>期限</label>
          <br />
          <input
            type="datetime-local"
            onChange={handleLimitChange}
            className="edit-task-limit"
            value={limit}
          />
          <br />
          <div>
            <input
              type="radio"
              id="todo"
              name="status"
              value="todo"
              onChange={handleIsDoneChange}
              checked={!isDone}
            />
            未完了
            <input
              type="radio"
              id="done"
              name="status"
              value="done"
              onChange={handleIsDoneChange}
              checked={isDone}
            />
            完了
          </div>
          <div>残り日時: {calculateRemainingDateTime()}</div>
          <button type="button" className="delete-task-button" onClick={onDeleteTask}>
            削除
          </button>
          <button type="button" className="edit-task-button" onClick={onUpdateTask}>
            更新
          </button>
        </form>
      </main>
    </div>
  );
};
