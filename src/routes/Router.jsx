import React from "react";
import { useSelector } from "react-redux";
// import { BrowserRouter, Route, Switch, Redirect, Navigate } from "react-router-dom";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Home } from "../pages/Home";
import { NotFound } from "../pages/NotFound";
import { SignIn } from "../pages/SignIn";
import { NewTask } from "../pages/NewTask";
import { NewList } from "../pages/NewList";
import { EditTask } from "../pages/EditTask";
import { SignUp } from "../pages/SignUp";
import { EditList } from "../pages/EditList";

export const Router = () => {
  const auth = useSelector((state) => state.auth.isSignIn);

  return (
    <BrowserRouter>
      {/* <Switch> */}
      <Routes>
        {/* <Route exact path="/signin" component={SignIn} /> */}
        <Route path="/signin" element={<SignIn />} />
        {/* <Route exact path="/signup" component={SignUp} /> */}
        <Route path="/signup" element={<SignUp />} />

        {auth ? (
          <>
            {/* <Route exact path="/" component={Home} />
            <Route exact path="/task/new" component={NewTask} />
            <Route exact path="/list/new" component={NewList} />
            <Route
              exact
              path="/lists/:listId/tasks/:taskId"
              component={EditTask}
            /> */}
            <Route exact path="/lists/:listId/edit" component={EditList} />
            <Route path="/" element={<Home />} />
            <Route path="/task/new" element={<NewTask />} />
            <Route path="/list/new" element={<NewList />} />
            <Route path="/lists/:listId/tasks/:taskId" element={<EditTask />} />
            <Route path="/lists/:listId/edit" element={<EditList />} />
          </>
        ) : (
          // <Redirect to="/signin" />
          <Route path="/" element={<Navigate to="/signin" />} />
        )}
        {/* <Route component={NotFound} /> */}
        <Route path="*" element={<NotFound />} />
        {/* </Switch> */}
      </Routes>
    </BrowserRouter>
  );
};
