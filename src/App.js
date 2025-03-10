import React, { useState, useEffect } from 'react';
import Controlehoras from './Controlehoras';
import Login from './components/Login';
import './App.css';

function App() {
  const [funcionario, setFuncionario] = useState(null);

  useEffect(() => {
    // Verifica se há um funcionário logado no localStorage
    const funcionarioSalvo = localStorage.getItem('funcionario');
    if (funcionarioSalvo) {
      setFuncionario(JSON.parse(funcionarioSalvo));
    }
  }, []);

  const handleLogin = (funcionarioData) => {
    setFuncionario(funcionarioData);
  };

  const handleLogout = () => {
    localStorage.removeItem('funcionario');
    setFuncionario(null);
  };

  if (!funcionario) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <div className="header">
        <span>Bem-vindo(a), {funcionario.nome}</span>
        <button onClick={handleLogout} className="btn-logout">
          Sair
        </button>
      </div>
      <Controlehoras funcionario={funcionario} />
    </div>
  );
}

export default App;