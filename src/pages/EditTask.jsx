import React, { useEffect, useState } from "react";
import { Header } from "../components/Header";
import axios from "axios";
import { useCookies } from "react-cookie";
import { url } from "../const";
// import { useHistory, useNavigate, useParams } from "react-router-dom";
import { useNavigate, useParams } from "react-router-dom";
import "./editTask.scss";

export const EditTask = () => {
  // const history = useHistory();
  const Navigate = useNavigate();
  const { listId, taskId } = useParams();
  const [cookies] = useCookies();
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [isDone, setIsDone] = useState();
  const [limit, setLimit] = useState("");  // 期限日時の追加
  const [errorMessage, setErrorMessage] = useState("");
  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleDetailChange = (e) => setDetail(e.target.value);
  const handleIsDoneChange = (e) => setIsDone(e.target.value === "done");
  const handleLimitChange = (e) => setLimit(e.target.value); // 期限の変更
  const onUpdateTask = () => {
    console.log(isDone);
    const data = {
      title: title,
      detail: detail,
      done: isDone,
      limit,
    };

    axios
      .put(`${url}/lists/${listId}/tasks/${taskId}`, data, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        console.log(res.data);
        // history.push("/");
        Navigate("/");
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
        // history.push("/");
        Navigate("/");
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
        setLimit(task.limit); // 期限日時を設定
      })
      .catch((err) => {
        setErrorMessage(`タスク情報の取得に失敗しました。${err}`);
      });
    // }, [])
  }, [cookies.token, listId, taskId]);

    // // 残り日時を計算する関数
    // const calculateRemainingTime = () => {
    //   if (!limit) return null;
    //   const now = new Date();
    //   const deadline = new Date(limit);
    //   const timeDiff = deadline - now;
    //   if (timeDiff <= 0) return "期限切れ";
    //   const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    //   const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    //   return `${hours}時間 ${minutes}分`;
    // };

    // 残り日時を計算する関数
    const calculateRemainingTime = () => {
      if (!limit) return null;
      const timeDiff = new Date(limit) - new Date();
      return timeDiff <= 0 ? "期限切れ" : `${Math.floor(timeDiff / (1000 * 60 * 60))}時間 ${Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))}分`;
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
            type="text"
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
            value={limit ? limit.slice(0, 16) : ""} // 期限の入力フォーム
         />
          <br />
          <div>
            <input
              type="radio"
              id="todo"
              name="status"
              value="todo"
              onChange={handleIsDoneChange}
              checked={isDone === false ? "checked" : ""}
            />
            未完了
            <input
              type="radio"
              id="done"
              name="status"
              value="done"
              onChange={handleIsDoneChange}
              checked={isDone === true ? "checked" : ""}
            />
            完了
          </div>
          <div>残り時間: {calculateRemainingTime()}</div> {/* 残り時間の表示 */}
          <button
            type="button"
            className="delete-task-button"
            onClick={onDeleteTask}
          >
            削除
          </button>
          <button
            type="button"
            className="edit-task-button"
            onClick={onUpdateTask}
          >
            更新
          </button>
        </form>
      </main>
    </div>
  );
};
