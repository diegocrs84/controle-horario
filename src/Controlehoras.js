import React, { useState, useEffect, useCallback } from "react";
import "./Controlehoras.css";
import CadastroFuncionario from './components/CadastroFuncionario';
import ListaFuncionarios from './components/ListaFuncionarios';
import LogExclusoes from './components/LogExclusoes';

// Obter a URL base do ambiente atual
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://controle-horario-60k8e5896-diegocrs84s-projects.vercel.app'
  : 'http://localhost:3000';

// Configuração da URL da API
const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://controle-horario-ro0q2yvzm-diegocrs84s-projects.vercel.app/api/registros'
  : 'http://localhost:5000/api/registros';

const Controlehoras = ({ funcionario }) => {
  const [entrada, setEntrada] = useState("");
  const [inicioAlmoco, setInicioAlmoco] = useState("");
  const [fimAlmoco, setFimAlmoco] = useState("");
  const [saidaPrevista, setSaidaPrevista] = useState("");
  const [saidaReal, setSaidaReal] = useState("");
  const [horasPrevistas, setHorasPrevistas] = useState("");
  const [horasReais, setHorasReais] = useState("");
  const [registros, setRegistros] = useState([]);
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });
  const [paginaAtual, setPaginaAtual] = useState('registrar'); // 'registrar', 'consultar', 'cadastro-funcionario', 'lista-funcionarios', 'log-exclusao'
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [registroEmEdicao, setRegistroEmEdicao] = useState(null);
  const [confirmacaoEdicao, setConfirmacaoEdicao] = useState(false);
  const [menuFuncionariosAberto, setMenuFuncionariosAberto] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    if (funcionario) {
      console.log('Cargo do funcionário:', funcionario.cargo);
      console.log('Página atual:', paginaAtual);
      fetchRegistros();
    }
  }, [funcionario, paginaAtual]);

  const fetchRegistros = async () => {
    try {
      const response = await fetch(`${API_URL}?funcionarioId=${funcionario._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors'
      });
      if (!response.ok) throw new Error('Erro ao buscar registros');
      const data = await response.json();
      
      // Filtra apenas os registros do usuário logado
      const registrosFiltrados = data.filter(registro => registro.funcionarioId === funcionario._id);
      setRegistros(registrosFiltrados);
    } catch (error) {
      console.error('Erro ao buscar registros:', error);
      setMensagem({ 
        texto: "Erro ao carregar registros. Verifique sua conexão.", 
        tipo: "erro" 
      });
    }
  };

  const calcularHoras = useCallback((hora1, hora2) => {
    if (!hora1 || !hora2) return 0;
    
    const [h1, m1] = hora1.split(':').map(Number);
    const [h2, m2] = hora2.split(':').map(Number);
    
    const totalMinutos = (h2 * 60 + m2) - (h1 * 60 + m1);
    return totalMinutos / 60;
  }, []);

  const calcularSaida = useCallback(() => {
    if (entrada && inicioAlmoco && fimAlmoco) {
      // Calcula o tempo antes do almoço
      const horasAnteAlmoco = calcularHoras(entrada, inicioAlmoco);
      
      // Calcula o tempo necessário após o almoço para completar 8:30 horas (8.5 hours)
      const horasRestantes = 8.5 - horasAnteAlmoco;
      
      // Calcula horário de saída previsto
      const [h, m] = fimAlmoco.split(':').map(Number);
      const minutosTotal = h * 60 + m + horasRestantes * 60;
      const horasSaida = Math.floor(minutosTotal / 60);
      const minutosSaida = Math.round(minutosTotal % 60);
      
      const saidaCalculada = `${String(horasSaida).padStart(2, '0')}:${String(minutosSaida).padStart(2, '0')}`;
      setSaidaPrevista(saidaCalculada);

      // Calcula horas previstas
      const horasPrevistasCalc = horasAnteAlmoco + calcularHoras(fimAlmoco, saidaCalculada);
      setHorasPrevistas(horasPrevistasCalc.toFixed(2));

      // Se tiver saída real, calcula horas reais
      if (saidaReal) {
        const horasReaisCalc = horasAnteAlmoco + calcularHoras(fimAlmoco, saidaReal);
        setHorasReais(horasReaisCalc.toFixed(2));
      }
    }
  }, [entrada, inicioAlmoco, fimAlmoco, saidaReal, calcularHoras]);

  useEffect(() => {
    calcularSaida();
  }, [calcularSaida]);

  const validarCampos = () => {
    if (!entrada) {
      setMensagem({ texto: "Por favor, preencha o horário de entrada", tipo: "erro" });
      return false;
    }
    if (!inicioAlmoco) {
      setMensagem({ texto: "Por favor, preencha o horário de início do almoço", tipo: "erro" });
      return false;
    }
    if (!fimAlmoco) {
      setMensagem({ texto: "Por favor, preencha o horário de fim do almoço", tipo: "erro" });
      return false;
    }
    return true;
  };

  const validarRegistroDuplicado = () => {
    const hoje = new Date().toISOString().split('T')[0];
    const registroHoje = registros.find(registro => {
      const dataRegistro = new Date(registro.data).toISOString().split('T')[0];
      return dataRegistro === hoje;
    });

    if (registroHoje) {
      setMensagem({ 
        texto: "Já existe um registro para o dia de hoje. Não é permitido mais de um registro por dia.", 
        tipo: "erro" 
      });
      return true;
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarCampos()) {
      return;
    }

    if (!funcionario) {
      setMensagem({ texto: "Usuário não autenticado", tipo: "erro" });
      return;
    }

    if (validarRegistroDuplicado()) {
      return;
    }

    try {
      setMensagem({ texto: "Salvando registro...", tipo: "info" });

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({
          funcionarioId: funcionario._id,
          funcionarioNome: funcionario.nome,
          entrada,
          inicioAlmoco,
          fimAlmoco,
          saidaPrevista,
          saidaReal,
          horasPrevistas,
          horasReais
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Erro ao salvar registro');
      }
      
      const novoRegistro = await response.json();
      setRegistros(prevRegistros => [novoRegistro, ...prevRegistros]);
      
      // Limpar campos
      setEntrada('');
      setInicioAlmoco('');
      setFimAlmoco('');
      setSaidaPrevista('');
      setSaidaReal('');
      setHorasPrevistas('');
      setHorasReais('');
      
      setMensagem({ texto: "Registro salvo com sucesso!", tipo: "sucesso" });
    } catch (error) {
      console.error('Erro ao salvar registro:', error);
      setMensagem({ 
        texto: error.message || "Erro ao salvar registro. Tente novamente.", 
        tipo: "erro" 
      });
    }
  };

  const filtrarRegistros = () => {
    return registros.filter(registro => {
      if (!dataInicio && !dataFim) return true;
      
      const dataRegistro = new Date(registro.data);
      const inicio = dataInicio ? new Date(dataInicio) : null;
      const fim = dataFim ? new Date(dataFim) : null;
      
      if (inicio && fim) {
        return dataRegistro >= inicio && dataRegistro <= fim;
      } else if (inicio) {
        return dataRegistro >= inicio;
      } else if (fim) {
        return dataRegistro <= fim;
      }
      
      return true;
    });
  };

  const calcularTotalHoras = (registros) => {
    return registros.reduce((total, registro) => {
      return total + parseFloat(registro.horasPrevistas || 0);
    }, 0).toFixed(2);
  };

  const calcularTotalHorasReais = (registros) => {
    return registros.reduce((total, registro) => {
      return total + parseFloat(registro.horasReais || 0);
    }, 0).toFixed(2);
  };

  const validarHorarios = (horarios) => {
    const { entrada, inicioAlmoco, fimAlmoco, saidaReal } = horarios;
    
    // Converter horários para minutos para facilitar comparação
    const converterParaMinutos = (hora) => {
      const [h, m] = hora.split(':').map(Number);
      return h * 60 + m;
    };

    const entradaMin = converterParaMinutos(entrada);
    const inicioAlmocoMin = converterParaMinutos(inicioAlmoco);
    const fimAlmocoMin = converterParaMinutos(fimAlmoco);
    const saidaRealMin = saidaReal ? converterParaMinutos(saidaReal) : null;

    // Validações
    if (inicioAlmocoMin <= entradaMin) {
      setMensagem({ 
        texto: "O início do almoço deve ser depois da entrada", 
        tipo: "erro" 
      });
      return false;
    }

    if (fimAlmocoMin <= inicioAlmocoMin) {
      setMensagem({ 
        texto: "O fim do almoço deve ser depois do início do almoço", 
        tipo: "erro" 
      });
      return false;
    }

    if (saidaRealMin && saidaRealMin <= fimAlmocoMin) {
      setMensagem({ 
        texto: "A saída real deve ser depois do fim do almoço", 
        tipo: "erro" 
      });
      return false;
    }

    return true;
  };

  const handleEditarRegistro = async (registro) => {
    if (!confirmacaoEdicao) {
      setMensagem({
        texto: "Confirme se os horários estão corretos antes de salvar",
        tipo: "info"
      });
      return;
    }

    try {
      const registroAtualizado = {
        ...atualizarHorasRegistro(registro),
        confirmado: true // Marca o registro como confirmado ao salvar
      };
      
      const response = await fetch(`${API_URL}/${registro._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify(registroAtualizado)
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar registro');
      }

      const registroSalvo = await response.json();
      
      setRegistros(prevRegistros => 
        prevRegistros.map(r => 
          r._id === registroSalvo._id ? registroSalvo : r
        )
      );

      setRegistroEmEdicao(null);
      setConfirmacaoEdicao(false);
      
      setMensagem({ 
        texto: "Registro atualizado com sucesso!", 
        tipo: "sucesso" 
      });
    } catch (error) {
      console.error('Erro ao atualizar registro:', error);
      setMensagem({ 
        texto: "Erro ao atualizar registro. Tente novamente.", 
        tipo: "erro" 
      });
    }
  };

  const atualizarHorasRegistro = (novoRegistro) => {
    if (!novoRegistro) return;

    const horasAnteAlmoco = calcularHoras(novoRegistro.entrada, novoRegistro.inicioAlmoco);
    const horasAposAlmoco = calcularHoras(novoRegistro.fimAlmoco, novoRegistro.saidaReal || novoRegistro.saidaPrevista);
    
    // Calcula saída prevista
    const horasRestantes = 8.5 - horasAnteAlmoco;
    const [h, m] = novoRegistro.fimAlmoco.split(':').map(Number);
    const minutosTotal = h * 60 + m + horasRestantes * 60;
    const horasSaida = Math.floor(minutosTotal / 60);
    const minutosSaida = Math.round(minutosTotal % 60);
    const saidaPrevista = `${String(horasSaida).padStart(2, '0')}:${String(minutosSaida).padStart(2, '0')}`;

    // Calcula horas previstas e reais
    const horasPrevistasCalc = horasAnteAlmoco + calcularHoras(novoRegistro.fimAlmoco, saidaPrevista);
    const horasReaisCalc = novoRegistro.saidaReal ? (horasAnteAlmoco + horasAposAlmoco) : null;

    return {
      ...novoRegistro,
      saidaPrevista,
      horasPrevistas: horasPrevistasCalc.toFixed(2),
      horasReais: horasReaisCalc ? horasReaisCalc.toFixed(2) : null
    };
  };

  // Atualizar o useEffect para usar a nova função
  useEffect(() => {
    if (registroEmEdicao) {
      const registroAtualizado = atualizarHorasRegistro(registroEmEdicao);
      if (registroAtualizado) {
        setRegistroEmEdicao(registroAtualizado);
      }
    }
  }, [registroEmEdicao?.entrada, registroEmEdicao?.inicioAlmoco, registroEmEdicao?.fimAlmoco, registroEmEdicao?.saidaReal]);

  // Atualizar os handlers de mudança de horário
  const handleChangeHorario = (campo, valor) => {
    setRegistroEmEdicao(prev => {
      const novoRegistro = { ...prev, [campo]: valor };
      return atualizarHorasRegistro(novoRegistro);
    });
  };

  const isRegistroHoje = (registro) => {
    const hoje = new Date().toISOString().split('T')[0];
    const dataRegistro = new Date(registro.data).toISOString().split('T')[0];
    return dataRegistro === hoje;
  };

  const handleDeletarRegistro = async (registro) => {
    if (registro.confirmado) {
      setMensagem({
        texto: "Não é possível deletar um registro que já foi confirmado",
        tipo: "erro"
      });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${registro._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar registro');
      }

      // Remove o registro da lista
      setRegistros(prevRegistros => 
        prevRegistros.filter(r => r._id !== registro._id)
      );

      setMensagem({
        texto: "Registro deletado com sucesso!",
        tipo: "sucesso"
      });
    } catch (error) {
      console.error('Erro ao deletar registro:', error);
      setMensagem({
        texto: "Erro ao deletar registro. Tente novamente.",
        tipo: "erro"
      });
    }
  };

  const handleEditarFuncionario = (funcionarioParaEditar) => {
    setPaginaAtual('cadastro-funcionario');
  };

  const toggleMenuFuncionarios = () => {
    setMenuFuncionariosAberto(!menuFuncionariosAberto);
  };

  const toggleMenu = () => {
    setMenuAberto(!menuAberto);
  };

  const fecharMenu = () => {
    setMenuAberto(false);
    setMenuFuncionariosAberto(false);
  };

  const handleMenuItemClick = (pagina) => {
    setPaginaAtual(pagina);
    fecharMenu();
  };

  // Fechar menu quando a janela for redimensionada
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMenuAberto(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fechar menu quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuAberto && !event.target.closest('.menu-lateral') && !event.target.closest('.toggle-menu')) {
        fecharMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuAberto]);

  const renderizarConteudo = () => {
    switch (paginaAtual) {
      case 'registrar':
        return (
          <div className="formulario-registro">
            <h3>Registro de Horário</h3>
            <div className="row">
              <div className="input-group">
                <label>Entrada:</label>
                <input type="time" value={entrada} onChange={(e) => setEntrada(e.target.value)} required />
              </div>
      
              <div className="input-group">
                <label>Início Almoço:</label>
                <input type="time" value={inicioAlmoco} onChange={(e) => setInicioAlmoco(e.target.value)} required />
              </div>
      
              <div className="input-group">
                <label>Fim Almoço:</label>
                <input type="time" value={fimAlmoco} onChange={(e) => setFimAlmoco(e.target.value)} required />
              </div>
      
              <div className="input-group">
                <label>Saída Prevista:</label>
                <input type="time" value={saidaPrevista} readOnly />
              </div>
      
              <div className="input-group">
                <label>Saída Real:</label>
                <input type="time" value={saidaReal} onChange={(e) => setSaidaReal(e.target.value)} />
              </div>
            </div>  
            <div className="info-horas">
              <div className="info-box previstas">
                <h3>
                  <i className="fas fa-clock"></i>
                  Horas Previstas
                </h3>
                <div className="valor">
                  {horasPrevistas || '0.00'}
                  <span className="unidade">h</span>
                </div>
                <div className="descricao">
                  Baseado no horário de entrada e intervalo
                </div>
              </div>
              <div className="info-box reais">
                <h3>
                  <i className="fas fa-check-circle"></i>
                  Horas Realizadas
                </h3>
                <div className="valor">
                  {horasReais || '0.00'}
                  <span className="unidade">h</span>
                </div>
                <div className="descricao">
                  Calculado com base na saída real
                </div>
              </div>
            </div>
            
            <button onClick={handleSubmit} className="btn-salvar">Salvar Registro</button>
          </div>
        );
      case 'consultar':
        return (
          <div className="secao-registros">
            <h3>Histórico de Registros</h3>
            
            <div className="filtros-registros">
              <div className="filtro-data">
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  placeholder="Data Início"
                />
                <span>até</span>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  placeholder="Data Fim"
                />
              </div>
            </div>

            <div className="resumo-horas">
              <div className="resumo-box previstas">
                <h4>
                  <i className="fas fa-clock"></i>
                  Total Previsto
                </h4>
                <div className="total">
                  {calcularTotalHoras(filtrarRegistros())}
                  <span className="unidade">h</span>
                </div>
              </div>
              <div className="resumo-box reais">
                <h4>
                  <i className="fas fa-check-circle"></i>
                  Total Realizado
                </h4>
                <div className="total">
                  {calcularTotalHorasReais(filtrarRegistros())}
                  <span className="unidade">h</span>
                </div>
              </div>
            </div>

            <div className="registros-grid">
              {registros.length === 0 ? (
                <p className="sem-registros">Nenhum registro encontrado</p>
              ) : (
                <>
                  <div className="grid-header">
                    <div className="grid-cell">Data</div>
                    <div className="grid-cell">Entrada</div>
                    <div className="grid-cell">Início Almoço</div>
                    <div className="grid-cell">Fim Almoço</div>
                    <div className="grid-cell">Saída Prevista</div>
                    <div className="grid-cell">Saída Real</div>
                  </div>
                  {filtrarRegistros().map((registro, index) => (
                    <React.Fragment key={index}>
                      <div className={`grid-row ${registroEmEdicao?._id === registro._id ? 'editando' : ''}`}>
                        <div className="grid-cell data">
                          {new Date(registro.data).toLocaleDateString('pt-BR')}
                        </div>
                        {registroEmEdicao?._id === registro._id ? (
                          <>
                            <div className="grid-cell">
                              <input
                                type="time"
                                value={registroEmEdicao.entrada}
                                onChange={(e) => handleChangeHorario('entrada', e.target.value)}
                              />
                            </div>
                            <div className="grid-cell">
                              <input
                                type="time"
                                value={registroEmEdicao.inicioAlmoco}
                                onChange={(e) => handleChangeHorario('inicioAlmoco', e.target.value)}
                              />
                            </div>
                            <div className="grid-cell">
                              <input
                                type="time"
                                value={registroEmEdicao.fimAlmoco}
                                onChange={(e) => handleChangeHorario('fimAlmoco', e.target.value)}
                              />
                            </div>
                            <div className="grid-cell">
                              <input
                                type="time"
                                value={registroEmEdicao.saidaPrevista}
                                readOnly
                              />
                            </div>
                            <div className="grid-cell">
                              <input
                                type="time"
                                value={registroEmEdicao.saidaReal || ''}
                                onChange={(e) => handleChangeHorario('saidaReal', e.target.value)}
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="grid-cell">{registro.entrada}</div>
                            <div className="grid-cell">{registro.inicioAlmoco}</div>
                            <div className="grid-cell">{registro.fimAlmoco}</div>
                            <div className="grid-cell">{registro.saidaPrevista}</div>
                            <div className="grid-cell">{registro.saidaReal || '-'}</div>
                          </>
                        )}
                      </div>
                      <div className="horas-container">
                        <div className="horas-grupo horas-previstas">
                          <span className="horas-label">Horas Previstas:</span>
                          <span className="horas-valor">
                            {registro.horasPrevistas}h
                          </span>
                        </div>
                        <div className="horas-grupo horas-reais">
                          <span className="horas-label">Horas Realizadas:</span>
                          <span className="horas-valor">
                            {registro.horasReais ? `${registro.horasReais}h` : '-'}
                          </span>
                        </div>
                      </div>
                      {registroEmEdicao?._id === registro._id && (
                        <div className="acoes-container">
                          <div className="confirmacao-edicao">
                            <label>
                              <input
                                type="checkbox"
                                checked={confirmacaoEdicao}
                                onChange={(e) => setConfirmacaoEdicao(e.target.checked)}
                              />
                              Confirmo que os horários estão corretos
                            </label>
                          </div>
                          <button
                            className="btn-salvar"
                            onClick={() => handleEditarRegistro(registroEmEdicao)}
                            disabled={!confirmacaoEdicao}
                          >
                            Salvar
                          </button>
                          <button
                            className="btn-cancelar"
                            onClick={() => {
                              setRegistroEmEdicao(null);
                              setConfirmacaoEdicao(false);
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                      {!registroEmEdicao && isRegistroHoje(registro) && (
                        <div className="acoes-container">
                          <button
                            className="btn-editar"
                            onClick={() => setRegistroEmEdicao(registro)}
                          >
                            Editar
                          </button>
                          {!registro.confirmado && (
                            <button
                              className="btn-deletar"
                              onClick={() => handleDeletarRegistro(registro)}
                            >
                              Deletar
                            </button>
                          )}
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </>
              )}
            </div>
          </div>
        );
      case 'cadastro-funcionario':
        return <CadastroFuncionario funcionario={funcionario} />;
      case 'lista-funcionarios':
        return <ListaFuncionarios 
          funcionario={funcionario} 
          onEditarClick={handleEditarFuncionario}
        />;
      case 'log-exclusao':
        return <LogExclusoes funcionario={funcionario} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <button className="toggle-menu" onClick={toggleMenu} aria-label="Toggle menu">
        <i className={`fas fa-${menuAberto ? 'times' : 'bars'}`}></i>
      </button>
      
      <nav className={`menu-lateral ${menuAberto ? 'aberto' : ''}`}>
        <div className="menu-header">
          <h2>Controle de Horas</h2>
          <div className="funcionario-info">
            <span>{funcionario?.nome}</span>
            <span className="cargo">{funcionario?.cargo}</span>
          </div>
        </div>
        <div className="menu-items">
          <button 
            className={`menu-item ${paginaAtual === 'registrar' ? 'ativo' : ''}`}
            onClick={() => handleMenuItemClick('registrar')}
          >
            <i className="fas fa-clock"></i>
            Registrar Horário
          </button>
          <button 
            className={`menu-item ${paginaAtual === 'consultar' ? 'ativo' : ''}`}
            onClick={() => handleMenuItemClick('consultar')}
          >
            <i className="fas fa-history"></i>
            Consultar Registros
          </button>
          
          <div className="menu-grupo">
            <button 
              className={`menu-item ${['cadastro-funcionario', 'lista-funcionarios', 'log-exclusao'].includes(paginaAtual) ? 'ativo' : ''}`}
              onClick={toggleMenuFuncionarios}
            >
              <i className="fas fa-users"></i>
              Funcionários
            </button>
            <div className={`submenu ${menuFuncionariosAberto ? 'aberto' : ''}`}>
              <button 
                className={`submenu-item ${paginaAtual === 'cadastro-funcionario' ? 'ativo' : ''}`}
                onClick={() => handleMenuItemClick('cadastro-funcionario')}
              >
                <i className="fas fa-user-plus"></i>
                Cadastrar
              </button>
              <button 
                className={`submenu-item ${paginaAtual === 'lista-funcionarios' ? 'ativo' : ''}`}
                onClick={() => handleMenuItemClick('lista-funcionarios')}
              >
                <i className="fas fa-list"></i>
                Listar Funcionários
              </button>
              <button 
                className={`submenu-item ${paginaAtual === 'log-exclusao' ? 'ativo' : ''}`}
                onClick={() => handleMenuItemClick('log-exclusao')}
              >
                <i className="fas fa-trash-alt"></i>
                Log de Exclusão
              </button>
            </div>
          </div>
        </div>
      </nav>

      {menuAberto && (
        <div className="menu-overlay ativo" onClick={fecharMenu}></div>
      )}

      <main className="conteudo-principal">
        {mensagem.texto && (
          <div className={`mensagem ${mensagem.tipo}`}>
            {mensagem.texto}
          </div>
        )}
        {renderizarConteudo()}
      </main>
    </div>
  );  
};

export default Controlehoras; 