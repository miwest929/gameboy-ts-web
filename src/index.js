import Raven from "raven-js";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.scss";

Raven.context(function() {
  ReactDOM.render(<App />, document.getElementById("root"));
});
