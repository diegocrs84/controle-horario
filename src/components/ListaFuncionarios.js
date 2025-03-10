import React, { useState, useEffect } from 'react';
import './ListaFuncionarios.css';

const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://controle-horario-ro0q2yvzm-diegocrs84s-projects.vercel.app/api/funcionarios'
  : 'http://localhost:5000/api/funcionarios';

const ListaFuncionarios = ({ funcionario, onEditarClick }) => {
  const [funcionarios, setFuncionarios] = useState([]);
  const [funcionarioParaExcluir, setFuncionarioParaExcluir] = useState(null);
  const [motivoExclusao, setMotivoExclusao] = useState('');
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

  useEffect(() => {
    carregarFuncionarios();
  }, []);

  const carregarFuncionarios = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Erro ao carregar funcionários');
      const data = await response.json();
      setFuncionarios(data);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      setMensagem({
        texto: 'Erro ao carregar a lista de funcionários',
        tipo: 'erro'
      });
    }
  };

  const handleExcluir = (funcionarioSelecionado) => {
    setFuncionarioParaExcluir(funcionarioSelecionado);
  };

  const confirmarExclusao = async () => {
    if (!motivoExclusao.trim()) {
      setMensagem({
        texto: 'Por favor, informe o motivo da exclusão',
        tipo: 'erro'
      });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${funcionarioParaExcluir._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          motivoExclusao,
          excluidoPor: funcionario.nome,
          dataExclusao: new Date()
        })
      });

      if (!response.ok) throw new Error('Erro ao excluir funcionário');

      setFuncionarios(prevFuncionarios => 
        prevFuncionarios.filter(f => f._id !== funcionarioParaExcluir._id)
      );
      
      setMensagem({
        texto: 'Funcionário excluído com sucesso',
        tipo: 'sucesso'
      });
      
      setFuncionarioParaExcluir(null);
      setMotivoExclusao('');
    } catch (error) {
      console.error('Erro ao excluir funcionário:', error);
      setMensagem({
        texto: 'Erro ao excluir funcionário',
        tipo: 'erro'
      });
    }
  };

  const cancelarExclusao = () => {
    setFuncionarioParaExcluir(null);
    setMotivoExclusao('');
  };

  return (
    <div className="lista-funcionarios">
      <div className="lista-funcionarios-header">
        <h2>Lista de Funcionários</h2>
        <span className="total-funcionarios">
          Total de funcionários: {funcionarios.length}
        </span>
      </div>

      {mensagem.texto && (
        <div className={`mensagem ${mensagem.tipo}`}>
          {mensagem.texto}
        </div>
      )}

      <div className="funcionarios-grid">
        <div className="grid-header">
          <div className="grid-header-cell">Nome</div>
          <div className="grid-header-cell">E-mail</div>
          <div className="grid-header-cell">Cargo</div>
          <div className="grid-header-cell">Departamento</div>
          <div className="grid-header-cell">Ações</div>
        </div>

        {funcionarios.length === 0 ? (
          <div className="sem-registros">
            <p>Nenhum funcionário cadastrado.</p>
          </div>
        ) : (
          funcionarios.map((func) => (
            <div key={func._id} className="grid-row">
              <div className="grid-cell" data-label="Nome">
                {func.nome}
              </div>
              <div className="grid-cell" data-label="E-mail">
                {func.email}
              </div>
              <div className="grid-cell" data-label="Cargo">
                {func.cargo}
              </div>
              <div className="grid-cell" data-label="Departamento">
                {func.departamento}
              </div>
              <div className="grid-cell acoes" data-label="Ações">
                <button
                  className="btn-acao btn-editar"
                  onClick={() => onEditarClick(func)}
                  title="Editar funcionário"
                >
                  <i className="fas fa-edit"></i>
                  <span className="btn-texto">Editar</span>
                </button>
                {func._id !== funcionario._id && (
                  <button
                    className="btn-acao btn-excluir"
                    onClick={() => handleExcluir(func)}
                    title="Excluir funcionário"
                  >
                    <i className="fas fa-trash-alt"></i>
                    <span className="btn-texto">Excluir</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {funcionarioParaExcluir && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirmar Exclusão</h3>
            </div>
            <div className="modal-body">
              <p>
                Tem certeza que deseja excluir o funcionário{' '}
                <strong>{funcionarioParaExcluir.nome}</strong>?
              </p>
              <textarea
                placeholder="Informe o motivo da exclusão"
                value={motivoExclusao}
                onChange={(e) => setMotivoExclusao(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button className="btn-cancelar" onClick={cancelarExclusao}>
                Cancelar
              </button>
              <button className="btn-confirmar" onClick={confirmarExclusao}>
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaFuncionarios; 