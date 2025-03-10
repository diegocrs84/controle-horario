import React, { useState, useEffect } from 'react';
import './LogExclusoes.css';

const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://controle-horario-ro0q2yvzm-diegocrs84s-projects.vercel.app/api/logs'
  : 'http://localhost:5000/api/logs';

const LogExclusoes = ({ funcionario }) => {
  const [logs, setLogs] = useState([]);
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

  useEffect(() => {
    carregarLogs();
  }, []);

  const carregarLogs = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Erro ao carregar logs');
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      setMensagem({ 
        texto: 'Erro ao carregar o histórico de exclusões', 
        tipo: 'erro' 
      });
    }
  };

  if (funcionario?.cargo !== 'Administrador') {
    return (
      <div className="mensagem erro">
        Você não tem permissão para acessar esta página.
      </div>
    );
  }

  return (
    <div className="log-container">
      <div className="log-card">
        <div className="log-header">
          <h2>Log de Exclusões</h2>
          <div className="log-info">
            Total de registros: {logs.length}
          </div>
        </div>

        {mensagem.texto && (
          <div className={`mensagem ${mensagem.tipo}`}>
            {mensagem.texto}
          </div>
        )}

        <div className="log-grid">
          <div className="grid-header">
            <div className="grid-cell">Data/Hora</div>
            <div className="grid-cell">Funcionário Excluído</div>
            <div className="grid-cell">Excluído por</div>
            <div className="grid-cell">Motivo</div>
          </div>
          {logs.length === 0 ? (
            <div className="sem-registros">
              Nenhum registro de exclusão encontrado
            </div>
          ) : (
            logs.map((log) => (
              <div key={log._id} className="grid-row">
                <div className="grid-cell" data-label="Data/Hora">
                  {new Date(log.dataExclusao).toLocaleString('pt-BR')}
                </div>
                <div className="grid-cell" data-label="Funcionário Excluído">
                  {log.funcionarioExcluido}
                </div>
                <div className="grid-cell" data-label="Excluído por">
                  {log.excluidoPor}
                </div>
                <div className="grid-cell" data-label="Motivo">
                  {log.motivoExclusao}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LogExclusoes; 