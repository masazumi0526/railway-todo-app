import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import { Header } from "../components/Header";
import { url } from "../const";
import "./home.scss";

export const Home = () => {
  const [isDoneDisplay, setIsDoneDisplay] = useState("todo"); // todo->未完了 done->完了
  const [lists, setLists] = useState([]);
  const [selectListId, setSelectListId] = useState();
  const [tasks, setTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [cookies] = useCookies();
  const location = useLocation();

  const handleIsDoneDisplayChange = (e) => setIsDoneDisplay(e.target.value);

  // リスト一覧を取得
  useEffect(() => {
    axios
      .get(`${url}/lists`, {
        headers: { authorization: `Bearer ${cookies.token}` },
      })
      .then((res) => {
        setLists(res.data);

        // URL に selectListId がある場合、それを選択
        const params = new URLSearchParams(location.search);
        const selectedId = params.get("selectListId");
        if (selectedId) {
          setSelectListId(Number(selectedId));
        } else if (res.data.length > 0) {
          setSelectListId(res.data[0].id);
        }
      })
      .catch((err) => {
        setErrorMessage(`リストの取得に失敗しました。${err}`);
      });
  }, [cookies.token, location.search]);

  // 選択中のリストのタスクを取得
  useEffect(() => {
    if (!selectListId) return;

    axios
      .get(`${url}/lists/${selectListId}/tasks`, {
        headers: { authorization: `Bearer ${cookies.token}` },
      })
      .then((res) => {
        const sortedTasks = res.data.tasks.sort((a, b) => {
          const deadlineA = new Date(a.limit);
          const deadlineB = new Date(b.limit);

          // 期限がない場合は、後ろに回す
          if (!deadlineA && !deadlineB) return 0;
          if (!deadlineA) return 1;
          if (!deadlineB) return -1;

          return deadlineA - deadlineB; // 期限が近い順に並べ替え
        });
        setTasks(sortedTasks);
      })
      .catch((err) => {
        setErrorMessage(`タスクの取得に失敗しました。${err}`);
      });
  }, [cookies.token, selectListId]);

  const handleSelectList = (id) => {
    setSelectListId(id);
    axios
      .get(`${url}/lists/${id}/tasks`, {
        headers: { authorization: `Bearer ${cookies.token}` },
      })
      .then((res) => {
        const sortedTasks = res.data.tasks.sort((a, b) => {
          const deadlineA = new Date(a.limit);
          const deadlineB = new Date(b.limit);

          // 期限がない場合は、後ろに回す
          if (!deadlineA && !deadlineB) return 0;
          if (!deadlineA) return 1;
          if (!deadlineB) return -1;

          return deadlineA - deadlineB; // 期限が近い順に並べ替え
        });
        setTasks(sortedTasks);
      })
      .catch((err) => {
        setErrorMessage(`タスクの取得に失敗しました。${err}`);
      });
  };

  // UTCから日本時間に変換する関数
  const convertToJST = (utcDate) => {
    const date = new Date(utcDate);
    const formattedDate = date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
    return formattedDate.slice(0, 16); // 時刻の「T」を除くために先頭16文字を取得
  };

  return (
    <div>
      <Header />
      <main className="taskList">
        <p className="error-message">{errorMessage}</p>
        <div>
          <div className="list-header">
            <h2>リスト一覧</h2>
            <div className="list-menu">
              <p>
                <Link to="/list/new">リスト新規作成</Link>
              </p>
              <p>
                <Link to={`/lists/${selectListId}/edit`}>
                  選択中のリストを編集
                </Link>
              </p>
            </div>
          </div>
          {/* <ul className="list-tab"> */}
          <ul className="list-tab" role="tablist">
            {lists.map((list, key) => {
              const isActive = list.id === selectListId;
              return (
                <li
                  key={key}
                  className={`list-tab-item ${isActive ? "active" : ""}`}
                  onClick={() => handleSelectList(list.id)}
                  role="tab" // (追加) タブの役割を明示
                  aria-selected={isActive} // (追加) 選択状態を示す
                  tabIndex="0" // (追加) キーボードフォーカス可能にする
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleSelectList(list.id); // (追加) Enterキーまたはスペースキーで選択
                    }
                  }}
                >
                  {list.title}
                </li>
              );
            })}
          </ul>
          <div className="tasks">
            <div className="tasks-header">
              <h2>タスク一覧</h2>
              <Link to="/task/new">タスク新規作成</Link>
            </div>
            <div className="display-select-wrapper">
              <select
                onChange={handleIsDoneDisplayChange}
                className="display-select"
                aria-label="タスク表示切り替え" // (追加) スクリーンリーダー向け説明を追加
              >
                <option value="todo">未完了</option>
                <option value="done">完了</option>
              </select>
            </div>
            <Tasks
              tasks={tasks}
              selectListId={selectListId}
              isDoneDisplay={isDoneDisplay}
              convertToJST={convertToJST}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

const Tasks = (props) => {
  const { tasks, selectListId, isDoneDisplay, convertToJST } = props;

  const calculateRemainingDateTime = (limit) => {
    if (!limit) return null;
    const now = new Date();
    const deadline = new Date(limit);
    const timeDiff = deadline - now;
    if (timeDiff <= 0) return "期限切れ";
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    return `${days}日 ${hours}時間 ${minutes}分`;
  };

  // 残り時間が1日を切った場合にスタイルを変更
  const getRemainingStyle = (limit) => {
    const now = new Date();
    const deadline = new Date(limit);
    const timeDiff = deadline - now;
    if (timeDiff > 0 && timeDiff < 1000 * 60 * 60 * 24) {
      return { fontWeight: "bold", color: "red", fontSize: "1.2em" };
    }
    return {};
  };

  if (!tasks) return <></>;

  return (
    <ul>
      {tasks
        .filter((task) => (isDoneDisplay === "done" ? task.done : !task.done))
        .map((task, key) => (
          <li key={key} className="task-item">
            <Link
              to={`/lists/${selectListId}/tasks/${task.id}`}
              className="task-item-link"
            >
              {task.title}
              <br />
              {task.done ? "完了" : "未完了"}
              <br />
              <small>期限: {task.limit ? convertToJST(task.limit) : "なし"}</small>
              <br />
              <small
                style={task.limit ? getRemainingStyle(task.limit) : {}}
              >
                残り日時: {calculateRemainingDateTime(task.limit)}
              </small>
            </Link>
          </li>
        ))}
    </ul>
  );
};
