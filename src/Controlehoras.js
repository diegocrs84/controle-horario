import React, { useState, useEffect } from "react";

const Controlehoras = () => {
  const [entrada, setEntrada] = useState("");
  const [inicioAlmoco, setInicioAlmoco] = useState("");
  const [fimAlmoco, setFimAlmoco] = useState("");
  const [saidaPrevista, setSaidaPrevista] = useState("");
  const [saidaReal, setSaidaReal] = useState("");
  const [horasPrevistas, setHorasPrevistas] = useState("");
  const [horasReais, setHorasReais] = useState("");
  const [registros, setRegistros] = useState([]);
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });

  useEffect(() => {
    carregarRegistros();
  }, []);

  const carregarRegistros = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/registros');
      if (!response.ok) {
        throw new Error('Erro ao carregar registros');
      }
      const data = await response.json();
      setRegistros(data);
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
      setMensagem({ texto: "Erro ao carregar registros. Verifique se o servidor está rodando.", tipo: "erro" });
    }
  };

  const calcularHoras = (hora1, hora2) => {
    if (!hora1 || !hora2) return 0;
    
    const [h1, m1] = hora1.split(':').map(Number);
    const [h2, m2] = hora2.split(':').map(Number);
    
    const totalMinutos = (h2 * 60 + m2) - (h1 * 60 + m1);
    return totalMinutos / 60;
  };

  const calcularSaida = () => {
    if (entrada && inicioAlmoco && fimAlmoco) {
      // Calcula o tempo antes do almoço
      const horasAnteAlmoco = calcularHoras(entrada, inicioAlmoco);
      
      // Calcula o tempo necessário após o almoço para completar 8:30 horas (8.5 horas)
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
  };

  useEffect(() => {
    calcularSaida();
  }, [entrada, inicioAlmoco, fimAlmoco, saidaReal]);

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

  const salvarRegistro = async () => {
    try {
      if (!validarCampos()) {
        return;
      }

      setMensagem({ texto: "Salvando registro...", tipo: "info" });

      const registro = {
        entrada,
        inicioAlmoco,
        fimAlmoco,
        saidaPrevista,
        saidaReal,
        horasPrevistas,
        horasReais
      };

      const response = await fetch('http://localhost:5000/api/registros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registro),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar registro');
      }

      await carregarRegistros();
      limparCampos();
      setMensagem({ texto: "Registro salvo com sucesso!", tipo: "sucesso" });
    } catch (error) {
      console.error('Erro ao salvar registro:', error);
      setMensagem({ texto: "Erro ao salvar registro. Verifique se o servidor está rodando.", tipo: "erro" });
    }
  };

  const limparCampos = () => {
    setEntrada("");
    setInicioAlmoco("");
    setFimAlmoco("");
    setSaidaPrevista("");
    setSaidaReal("");
    setHorasPrevistas("");
    setHorasReais("");
    setMensagem({ texto: "", tipo: "" });
  };

  return (
    <div className="container">
      <h2>Controle de Horas</h2>
  
      {mensagem.texto && (
        <div className={`mensagem ${mensagem.tipo}`}>
          {mensagem.texto}
        </div>
      )}

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
      <h3>Horas Previstas de Trabalho: {horasPrevistas} horas</h3>
      <h3>Horas Reais de Trabalho: {horasReais} horas</h3>
      
      <button onClick={salvarRegistro} className="btn-salvar">Salvar Registro</button>

      <h3>Registros Anteriores</h3>
      <div className="registros-lista">
        {registros.length === 0 ? (
          <p className="sem-registros">Nenhum registro encontrado</p>
        ) : (
          registros.map((registro, index) => (
            <div key={index} className="registro-item">
              <p><strong>Data:</strong> {new Date(registro.data).toLocaleDateString()}</p>
              <p><strong>Entrada:</strong> {registro.entrada}</p>
              <p><strong>Início Almoço:</strong> {registro.inicioAlmoco}</p>
              <p><strong>Fim Almoço:</strong> {registro.fimAlmoco}</p>
              <p><strong>Saída Prevista:</strong> {registro.saidaPrevista}</p>
              <p><strong>Saída Real:</strong> {registro.saidaReal || '-'}</p>
              <p><strong>Horas Previstas:</strong> {registro.horasPrevistas} horas</p>
              <p><strong>Horas Reais:</strong> {registro.horasReais || '-'} horas</p>
            </div>
          ))
        )}
      </div>
    </div>
  );  
};

export default Controlehoras; 