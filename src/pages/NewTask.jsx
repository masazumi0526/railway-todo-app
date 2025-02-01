import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import axios from "axios";
import { url } from "../const";
import { Header } from "../components/Header";
import "./newTask.scss";
// import { useHistory } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export const NewTask = () => {
  const [selectListId, setSelectListId] = useState();
  const [lists, setLists] = useState([]);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [limit, setLimit] = useState(""); // 期限日時の追加
  const [errorMessage, setErrorMessage] = useState("");
  const [cookies] = useCookies();
  // const history = useHistory();
  const Navigate = useNavigate();
  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleDetailChange = (e) => setDetail(e.target.value);
  const handleLimitChange = (e) => setLimit(e.target.value); // 期限の変更
  const handleSelectList = (id) => setSelectListId(id);
  const onCreateTask = () => {
    if (!selectListId) {
      setErrorMessage("リストが選択されていません。");
      return;
    }
    const data = {
      title: title,
      detail: detail,
      done: false,
      limit: limit ? new Date(limit).toISOString() : null, // 期限日時を含めて送信
    };

    axios
      .post(`${url}/lists/${selectListId}/tasks`, data, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then(() => {
        // history.push("/");
        Navigate("/");
      })
      .catch((err) => {
        setErrorMessage(`タスクの作成に失敗しました。${err}`);
      });
  };

  useEffect(() => {
    axios
      .get(`${url}/lists`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setLists(res.data);
        if (res.data.length > 0) {
          setSelectListId(res.data[0].id);
          console.log("デフォルトのリスト ID:", res.data[0].id);
        } else {
          setErrorMessage("リストが見つかりません。");
        }
      })
      .catch((err) => {
        setErrorMessage(`リストの取得に失敗しました。${err.response?.data?.message || err}`);
      });
  }, [cookies.token]);

  return (
    <div>
      <Header />
      <main className="new-task">
        <h2>タスク新規作成</h2>
        <p className="error-message">{errorMessage}</p>
        <form className="new-task-form">
          <label>リスト</label>
          <br />
          <select
            onChange={(e) => handleSelectList(e.target.value)}
            className="new-task-select-list"
          >
            {lists.map((list, key) => (
              <option key={key} className="list-item" value={list.id}>
                {list.title}
              </option>
            ))}
          </select>
          <br />
          <label>タイトル</label>
          <br />
          <input
            type="text"
            onChange={handleTitleChange}
            className="new-task-title"
          />
          <br />
          <label>詳細</label>
          <br />
          <textarea
            onChange={handleDetailChange}
            className="new-task-detail"
          />
          <br />
          <label>期限</label>
          <br />
          <input
            type="datetime-local"
            onChange={handleLimitChange}
            className="new-task-limit"
          />
          <br />
          <button
            type="button"
            className="new-task-button"
            onClick={onCreateTask}
          >
            作成
          </button>
        </form>
      </main>
    </div>
  );
};
