import * as React from "react";

import Game from "./components/Game";

import "./App.css";

function App() {
  return (
    <div className="app">
      <Game numItemsPerGroup={[3, 5, 7]} />
    </div>
  );
}

export default App;
