import React, { useState } from "react";
import { useCookies } from "react-cookie";
import axios from "axios";
import { Header } from "../components/Header";
import { useNavigate } from "react-router-dom";
import { url } from "../const";
import "./newList.scss";

export const NewList = () => {
  const [cookies] = useCookies();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleTitleChange = (e) => setTitle(e.target.value);

  const onCreateList = () => {
    const data = { title };

    axios
      .post(`${url}/lists`, data, {
        headers: { authorization: `Bearer ${cookies.token}` },
      })
      .then((res) => {
        const newListId = res.data.id; // 新しく作成したリストの ID を取得

        // リスト一覧を取得し直す
        axios
          .get(`${url}/lists`, {
            headers: { authorization: `Bearer ${cookies.token}` },
          })
          .then((res) => {
            const lists = res.data;

            // 期限が切れていないリストと期限切れのリストを分ける
            const currentDate = new Date();
            const validLists = lists.filter((list) => new Date(list.deadline) >= currentDate);
            const expiredLists = lists.filter((list) => new Date(list.deadline) < currentDate);

            // 残り時間が短い順に並べ替え（期限が近い順）
            validLists.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

            // 期限切れのリストは期限が過去のものから表示
            expiredLists.sort((a, b) => new Date(b.deadline) - new Date(a.deadline));

            // 並べ替えたリストを結合
            const sortedLists = [...validLists, ...expiredLists];

            // 最後のリストを選択
            const lastListId = sortedLists.length > 0 ? sortedLists[sortedLists.length - 1].id : newListId;

            // 一覧画面に遷移し、最後のリストを選択
            navigate(`/?selectListId=${lastListId}`);
          })
          .catch((err) => {
            setErrorMessage(`リストの取得に失敗しました。${err}`);
          });
      })
      .catch((err) => {
        setErrorMessage(`リストの作成に失敗しました。${err}`);
      });
  };

  return (
    <div>
      <Header />
      <main className="new-list">
        <h2>リスト新規作成</h2>
        <p className="error-message">{errorMessage}</p>
        <form className="new-list-form">
          <label>タイトル</label>
          <br />
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            className="new-list-title"
          />
          <br />
          <button
            type="button"
            onClick={onCreateList}
            className="new-list-button"
          >
            作成
          </button>
        </form>
      </main>
    </div>
  );
};
