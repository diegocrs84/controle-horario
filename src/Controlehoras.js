import React, { useState } from "react";

const Controlehoras = () => {
  const [entrada, setEntrada] = useState("");
  const [inicioAlmoco, setInicioAlmoco] = useState("");
  const [fimAlmoco, setFimAlmoco] = useState("");
  const [saidaPrevista, setSaidaPrevista] = useState("");
  const [saidaReal, setSaidaReal] = useState("");
  const [horasPrevistas, setHorasPrevistas] = useState("");
  const [horasReais, setHorasReais] = useState("");

  const calcularSaida = () => {
    if (!entrada || !inicioAlmoco || !fimAlmoco) {
      alert("Preencha todos os campos!");
      return;
    }
  
    const entradaTime = new Date(`1970-01-01T${entrada}:00`);
    const inicioAlmocoTime = new Date(`1970-01-01T${inicioAlmoco}:00`);
    const fimAlmocoTime = new Date(`1970-01-01T${fimAlmoco}:00`);
  
    // Tempo de trabalho previsto (8h 30min) em milissegundos
    const hrPrevTrabMs = (8 * 60 + 30) * 60 * 1000; // 8h30min -> milissegundos
    // Tempo de intervalo de almoço (1h) em milissegundos
    const intervAlmMs = 1 * 60 * 60 * 1000; // 1h -> milissegundos
  
    // Cálculo da saída prevista
    const saidaPrevistaTime = new Date(entradaTime.getTime() + hrPrevTrabMs + intervAlmMs);
  
    setSaidaPrevista(saidaPrevistaTime.toTimeString().substring(0, 5));
  
    if (saidaReal) {
      const saidaRealTime = new Date(`1970-01-01T${saidaReal}:00`);
  
      // Cálculo de horas trabalhadas
      const tempoTrabalhoPrevisto = (saidaPrevistaTime - entradaTime) - (fimAlmocoTime - inicioAlmocoTime);
      const tempoTrabalhoReal = (saidaRealTime - entradaTime) - (fimAlmocoTime - inicioAlmocoTime);
  
      setHorasPrevistas(formatarHoras(tempoTrabalhoPrevisto));
      setHorasReais(formatarHoras(tempoTrabalhoReal));
    }
  };
  

  const formatarHoras = (ms) => {
    const horas = Math.floor(ms / 3600000);
    const minutos = Math.floor((ms % 3600000) / 60000);
    return `${horas}:${minutos < 10 ? "0" : ""}${minutos}`;
  };

  return (
    <div className="container">
      <h2>Controle de Horas</h2>
  
      {/* Linha para os inputs ficarem lado a lado */}

      <div className="row">
        <div className="input-group">
          <label>Entrada:</label>
          <input type="time" value={entrada} onChange={(e) => setEntrada(e.target.value)} />
        </div>
  
        <div className="input-group">
          <label>Início Almoço:</label>
          <input type="time" value={inicioAlmoco} onChange={(e) => setInicioAlmoco(e.target.value)} />
        </div>
  
        <div className="input-group">
          <label>Fim Almoço:</label>
          <input type="time" value={fimAlmoco} onChange={(e) => setFimAlmoco(e.target.value)}onBlur={calcularSaida} />
        </div>
  
        <div className="input-group">
          <label>Saída Prevista:</label>
          <input type="time" value={saidaPrevista} readOnly />
        </div>
  
        <div className="input-group">
          <label>Saída Real:</label>
          <input type="time" value={saidaReal} onChange={(e) => setSaidaReal(e.target.value)}onBlur={calcularSaida} />
        </div>
      </div>
  
      <button onClick={calcularSaida}>Calcular Saída</button>
  
      <h3>Horas Previstas de Trabalho: {horasPrevistas}</h3>
      <h3>Horas Reais de Trabalho: {horasReais}</h3>
    </div>
  );  
};
export default Controlehoras;
