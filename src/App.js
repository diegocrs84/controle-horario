import React from "react";
import ControleHoras from "./Controlehoras";
import logohorario from "./images/logohorario.jpg";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logohorario} alt="Controle Horas" className="logo" />
      </header>
      <main>
        <ControleHoras />
      </main>
    </div>
  );
}

export default App;