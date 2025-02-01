import React from "react";
import { useCookies } from "react-cookie";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signOut } from "../authSlice";
import "./header.scss";

export const Header = () => {
  const auth = useSelector((state) => state.auth.isSignIn); // サインイン状態を取得
  const dispatch = useDispatch(); // Reduxのdispatch関数
  const navigate = useNavigate(); // React Router のナビゲーション
  const [, , removeCookie] = useCookies(); // removeCookie を使うために useCookies を配列で受け取る

  const handleSignOut = () => {
    dispatch(signOut()); // ReduxのsignOutアクションをディスパッチ
    removeCookie("token"); // 'token' クッキーを削除
    navigate("/signin"); // サインインページに遷移
  };

  return (
    <header className="header">
      <h1>Todoアプリ</h1>
      {auth ? (
        <button onClick={handleSignOut} className="sign-out-button">
          サインアウト
        </button>
      ) : (
        <></>
      )}
    </header>
  );
};
