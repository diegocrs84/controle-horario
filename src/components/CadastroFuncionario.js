import React, { useState, useEffect } from 'react';
import './CadastroFuncionario.css';

const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://controle-horario-ro0q2yvzm-diegocrs84s-projects.vercel.app/api/funcionarios'
  : 'http://localhost:5000/api/funcionarios';

const CadastroFuncionario = ({ funcionario }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    cargo: '',
    departamento: '',
    isAdmin: false
  });

  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });
  const [modoEdicao, setModoEdicao] = useState(false);
  const [funcionarioEditando, setFuncionarioEditando] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const validarFormulario = () => {
    if (!formData.nome || !formData.email || !formData.senha || !formData.cargo || !formData.departamento) {
      setMensagem({ texto: 'Por favor, preencha todos os campos obrigatórios', tipo: 'erro' });
      return false;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setMensagem({ texto: 'As senhas não coincidem', tipo: 'erro' });
      return false;
    }

    if (formData.senha.length < 6) {
      setMensagem({ texto: 'A senha deve ter no mínimo 6 caracteres', tipo: 'erro' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!funcionario?.cargo === 'Administrador') {
      setMensagem({
        texto: "Apenas administradores podem cadastrar novos funcionários",
        tipo: "erro"
      });
      return;
    }

    if (!validarFormulario()) {
      return;
    }

    try {
      const method = modoEdicao ? 'PUT' : 'POST';
      const url = modoEdicao ? `${API_URL}/${funcionarioEditando._id}` : API_URL;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
          cargo: formData.isAdmin ? 'Administrador' : formData.cargo,
          departamento: formData.departamento
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Erro ao salvar funcionário');
      }

      setMensagem({ 
        texto: `Funcionário ${modoEdicao ? 'atualizado' : 'cadastrado'} com sucesso!`, 
        tipo: 'sucesso' 
      });

      // Limpar formulário após sucesso
      setFormData({
        nome: '',
        email: '',
        senha: '',
        confirmarSenha: '',
        cargo: '',
        departamento: '',
        isAdmin: false
      });
      setModoEdicao(false);
      setFuncionarioEditando(null);

    } catch (error) {
      console.error('Erro ao salvar funcionário:', error);
      setMensagem({ 
        texto: error.message || 'Erro ao salvar funcionário. Tente novamente.', 
        tipo: 'erro' 
      });
    }
  };

  if (!funcionario?.cargo === 'Administrador') {
    return (
      <div className="mensagem erro">
        Você não tem permissão para acessar esta página.
      </div>
    );
  }

  return (
    <div className="cadastro-container">
      <div className="cadastro-card">
        <h2>Cadastro de Funcionário</h2>
        
        {mensagem.texto && (
          <div className={`mensagem ${mensagem.tipo}`}>
            {mensagem.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} className="cadastro-form">
          <div className="form-group">
            <label htmlFor="nome">Nome Completo*</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Digite o nome completo"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-mail*</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Digite o e-mail"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="senha">Senha*</label>
              <input
                type="password"
                id="senha"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                placeholder="Digite a senha"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmarSenha">Confirmar Senha*</label>
              <input
                type="password"
                id="confirmarSenha"
                name="confirmarSenha"
                value={formData.confirmarSenha}
                onChange={handleChange}
                placeholder="Confirme a senha"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cargo">Cargo*</label>
              <select
                id="cargo"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                disabled={formData.isAdmin}
              >
                <option value="">Selecione o cargo</option>
                <option value="Administrador">Administrador</option>
                <option value="Gerente">Gerente</option>
                <option value="Analista">Analista</option>
                <option value="Desenvolvedor">Desenvolvedor</option>
                <option value="Assistente">Assistente</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="departamento">Departamento*</label>
              <select
                id="departamento"
                name="departamento"
                value={formData.departamento}
                onChange={handleChange}
              >
                <option value="">Selecione o departamento</option>
                <option value="TI">TI</option>
                <option value="RH">RH</option>
                <option value="Financeiro">Financeiro</option>
                <option value="Comercial">Comercial</option>
                <option value="Operacional">Operacional</option>
              </select>
            </div>
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={formData.isAdmin}
                onChange={(e) => {
                  setFormData(prevState => ({
                    ...prevState,
                    isAdmin: e.target.checked
                  }));
                  if (e.target.checked) {
                    setFormData(prevState => ({
                      ...prevState,
                      cargo: 'Administrador'
                    }));
                  } else {
                    setFormData(prevState => ({
                      ...prevState,
                      cargo: ''
                    }));
                  }
                }}
              />
              Este usuário é Administrador do sistema
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-salvar">
              {modoEdicao ? 'Atualizar' : 'Cadastrar'}
            </button>
            {modoEdicao && (
              <button type="button" onClick={() => {
                setFormData({
                  nome: '',
                  email: '',
                  senha: '',
                  confirmarSenha: '',
                  cargo: '',
                  departamento: '',
                  isAdmin: false
                });
                setModoEdicao(false);
                setFuncionarioEditando(null);
              }} className="btn-cancelar">
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastroFuncionario; 