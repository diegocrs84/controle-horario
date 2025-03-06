import React from "react";
import ControleHoras from "./Controlehoras";
import logohorario from "./logohorario.jpg";
import "./ControleHoras.css";

function App() {
return (
  <div className="App">
    <header className="App-header">
      <img src={logohorario} alt="Controle Horas" width="150" />
      <h1>ControleHoras</h1>
    </header>
  </div>
);
}

export default App;
