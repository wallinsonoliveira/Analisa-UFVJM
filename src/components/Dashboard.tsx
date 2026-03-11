import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, CheckCircle, ArrowRightLeft, Info, FileText, Files, Percent, Building2, ChevronDown, BookOpen } from 'lucide-react';
import { fetchData, ProcessRecord } from '../services/dataService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  LabelList,
  PieChart,
  Pie
} from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState<ProcessRecord[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'capa' | 'mapeamento' | 'glossario'>('capa');

  // Filters
  const [ano, setAno] = useState('Todos');
  const [proReitoria, setProReitoria] = useState('Todos');
  const [setor, setSetor] = useState('Todos');
  const [status, setStatus] = useState('Todos');

  useEffect(() => {
    fetchData().then((res) => {
      setData(res.records);
      setLastUpdated(res.lastUpdated);
      setLoading(false);
    });
  }, []);

  // Filter options
  const anos = ['Todos', '2021', '2022', '2023', '2024', '2025'];
  const proReitorias = ['Todos', ...Array.from(new Set(data.map(d => d.proReitoria))).sort()];
  
  // Setores depend on selected Pro-Reitoria
  const setores = useMemo(() => {
    let filtered = data;
    if (proReitoria !== 'Todos') {
      filtered = filtered.filter(d => d.proReitoria === proReitoria);
    }
    return ['Todos', ...Array.from(new Set(filtered.map(d => d.setor))).sort()];
  }, [data, proReitoria]);

  const statuses = ['Todos', 'Mapeados', 'Existentes'];

  // Filtered data
  const filteredData = useMemo(() => {
    return data.filter(d => {
      if (ano !== 'Todos' && d.ano !== ano) return false;
      if (proReitoria !== 'Todos' && d.proReitoria !== proReitoria) return false;
      if (setor !== 'Todos' && d.setor !== setor) return false;
      if (status !== 'Todos' && d.status !== status) return false;
      return true;
    });
  }, [data, ano, proReitoria, setor, status]);

  // Chart 1: Processos por Ano e Status
  const chart1Data = useMemo(() => {
    // If ano is filtered, we only show that year, otherwise all years.
    // We group by year, then sum Mapeados and Existentes.
    const years = ano === 'Todos' ? ['2021', '2022', '2023', '2024', '2025'] : [ano];
    
    // We need to use data filtered by ProReitoria and Setor, but maybe not by Ano and Status for this chart?
    // Wait, if Ano is filtered, the chart only shows that Ano.
    // If Status is filtered, it only shows that Status.
    
    return years.map(y => {
      const yearData = filteredData.filter(d => d.ano === y);
      const mapeados = yearData.filter(d => d.status === 'Mapeados').reduce((sum, d) => sum + d.quantidade, 0);
      const existentes = yearData.filter(d => d.status === 'Existentes').reduce((sum, d) => sum + d.quantidade, 0);
      return {
        name: y,
        Mapeados: mapeados,
        Existentes: existentes
      };
    });
  }, [filteredData, ano]);

  // Data filtered by everything EXCEPT status, useful for charts that compare Mapeados vs Existentes
  const statusIgnoredData = useMemo(() => {
    return data.filter(item => {
      if (ano !== 'Todos' && item.ano !== ano) return false;
      if (proReitoria !== 'Todos' && item.proReitoria !== proReitoria) return false;
      if (setor !== 'Todos' && item.setor !== setor) return false;
      return true;
    });
  }, [data, ano, proReitoria, setor]);

  // Chart 2: Processos Mapeados por Setor
  const chart2Data = useMemo(() => {
    // Group by Setor
    const setorMap = new Map<string, { mapeados: number, existentes: number }>();
    
    statusIgnoredData.forEach(d => {
      if (!setorMap.has(d.setor)) {
        setorMap.set(d.setor, { mapeados: 0, existentes: 0 });
      }
      const current = setorMap.get(d.setor)!;
      if (d.status === 'Mapeados') current.mapeados += d.quantidade;
      if (d.status === 'Existentes') current.existentes += d.quantidade;
    });

    return Array.from(setorMap.entries()).map(([name, counts]) => {
      const percentage = counts.existentes > 0 ? (counts.mapeados / counts.existentes) * 100 : 0;
      return {
        name,
        percentage: parseFloat(percentage.toFixed(2)),
        mapeados: counts.mapeados,
        existentes: counts.existentes
      };
    }).sort((a, b) => b.percentage - a.percentage); // Sort by percentage descending
  }, [statusIgnoredData]);

  // Chart 3: Acumulado de Processos Mapeados por Ano
  const chart3Data = useMemo(() => {
    // For the cumulative chart, we should ignore the 'ano' and 'status' filters
    // so the trend over time and the percentage calculation (Mapeados/Existentes) remain correct.
    const structuralData = data.filter(item => {
      if (proReitoria !== 'Todos' && item.proReitoria !== proReitoria) return false;
      if (setor !== 'Todos' && item.setor !== setor) return false;
      return true;
    });

    const years = ['2021', '2022', '2023', '2024', '2025'];
    let cumulativeMapeados = 0;
    let cumulativeExistentes = 0;
    
    return years.map(y => {
      const yearData = structuralData.filter(d => d.ano === y);
      const mapeados = yearData.filter(d => d.status === 'Mapeados').reduce((sum, d) => sum + d.quantidade, 0);
      const existentes = yearData.filter(d => d.status === 'Existentes').reduce((sum, d) => sum + d.quantidade, 0);
      
      cumulativeMapeados += mapeados;
      cumulativeExistentes += existentes;
      
      const percentage = cumulativeExistentes > 0 ? (cumulativeMapeados / cumulativeExistentes) * 100 : 0;
      return {
        name: y,
        percentage: parseFloat(percentage.toFixed(2))
      };
    });
  }, [data, proReitoria, setor]);

  // Chart 4: Processos Mapeados (Gauge)
  const totalMapeados = useMemo(() => statusIgnoredData.filter(d => d.status === 'Mapeados').reduce((sum, d) => sum + d.quantidade, 0), [statusIgnoredData]);
  const totalExistentes = useMemo(() => statusIgnoredData.filter(d => d.status === 'Existentes').reduce((sum, d) => sum + d.quantidade, 0), [statusIgnoredData]);

  const clearFilters = () => {
    setAno('Todos');
    setProReitoria('Todos');
    setSetor('Todos');
    setStatus('Todos');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-slate-500">Carregando dados...</div>;
  }

  if (activeTab === 'capa') {
    return (
      <div className="min-h-screen bg-[#003b73] relative overflow-hidden flex flex-col font-sans">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        <div className="relative z-10 flex flex-col min-h-screen p-8 lg:p-12">
          {/* Header */}
          <div className="flex justify-between items-start w-full">
            {/* UFVJM Logo */}
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="Logo UFVJM" className="h-24 object-contain" />
            </div>
            {/* ANALISA Logo */}
            <div className="text-right">
              <h2 className="text-2xl font-black text-[#4fd1c5] tracking-widest leading-none">ANALISA</h2>
              <h2 className="text-4xl font-black text-white tracking-widest leading-none mt-1">UFVJM</h2>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex items-center w-full max-w-7xl mx-auto mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">
              {/* Left Column */}
              <div className="flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-white mb-12">Diretoria de Governança de Dados (DGI)</h3>
                <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">Painel do Escritório de Processos</h2>
                <p className="text-xl text-white/90 mb-16">Indicadores referentes ao Escritório de Processos</p>
                
                <div className="inline-block" style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))' }}>
                  <button 
                    onClick={() => setActiveTab('mapeamento')}
                    className="bg-[#e2e8f0] text-slate-900 font-bold text-xl py-4 flex items-center justify-center hover:bg-white transition-colors"
                    style={{ 
                      clipPath: 'polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%, 10% 50%)',
                      width: '280px'
                    }}
                  >
                    Iniciar Análise
                  </button>
                </div>
              </div>

              {/* Right Column */}
              <div className="flex flex-col justify-between relative h-full min-h-[500px]">
                {/* Illustration */}
                <div className="flex-1 flex items-center justify-center">
                  <img src="/logoescritorio.png" alt="Ilustração Escritório de Processos" className="w-full max-w-lg object-contain" />
                </div>

                {/* Footer Info */}
                <div className="border border-white/30 p-5 text-xs text-white/90 mt-12 bg-[#003b73]/60 backdrop-blur-md rounded-sm">
                  <p className="mb-1.5"><strong className="text-white">Elaboração:</strong> Divisão de Governança e Qualidade de TI / STI, mediante solicitação e revisão pela Diretoria de Governança de Dados (DGI)</p>
                  <p className="mb-1.5"><strong className="text-white">Frequência de atualização:</strong> Diária.</p>
                  <p className="mb-1.5"><strong className="text-white">Fonte de dados:</strong> Controles internos do Escritório de Processos</p>
                  <p><strong className="text-white">Para mais informações:</strong> escritoriodeprocessos@ufvjm.edu.br e (38) 3529-2995</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white px-8 py-6 flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center gap-4">
          <img src="/logo2.png" alt="Logo UFVJM" className="w-14 h-14 object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Painel de Mapeamento de Processos</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide uppercase mt-1">Indicadores referentes ao mapeamento de processos da UFVJM</p>
          </div>
        </div>
        <button 
          onClick={() => setActiveTab('capa')}
          className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar à Página Inicial
        </button>
      </header>

      <main className="max-w-[1400px] mx-auto px-8 py-8 space-y-8">
        {/* Success Banner */}
        <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4 flex items-center gap-3 text-[#15803d]">
          <CheckCircle size={20} className="text-[#22c55e]" />
          <span className="font-medium text-sm">
            {lastUpdated 
              ? `Atualizado em ${new Date(lastUpdated).toLocaleDateString('pt-BR')} e ${new Date(lastUpdated).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` 
              : 'Base de dados carregada com sucesso'}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-slate-100">
          <button 
            onClick={() => setActiveTab('mapeamento')}
            className={`flex items-center gap-2 pb-4 border-b-2 font-bold text-sm tracking-wide uppercase transition-colors ${activeTab === 'mapeamento' ? 'border-[#2563eb] text-[#2563eb]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <ArrowRightLeft size={18} />
            Mapeamento de Processos
          </button>
          <button 
            onClick={() => setActiveTab('glossario')}
            className={`flex items-center gap-2 pb-4 border-b-2 font-bold text-sm tracking-wide uppercase transition-colors ${activeTab === 'glossario' ? 'border-[#2563eb] text-[#2563eb]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <Info size={18} />
            Glossário
          </button>
        </div>

        {activeTab === 'glossario' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Glossário</h2>
            <p className="text-slate-600 mb-8">
              Abaixo estão os termos técnicos utilizados neste painel. Para adicionar mais informações, basta editar o arquivo <code className="bg-slate-100 px-2 py-1 rounded text-sm text-pink-600 font-mono">src/components/Dashboard.tsx</code> e adicionar novos blocos dentro da seção do glossário.
            </p>
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-bold text-slate-800">Processo Mapeado</h3>
                <p className="text-slate-600 mt-1">Processo que já passou por todas as etapas de levantamento, modelagem e documentação, possuindo um fluxo definido e aprovado.</p>
              </div>
              <div className="border-l-4 border-emerald-500 pl-4">
                <h3 className="text-lg font-bold text-slate-800">Processo Existente</h3>
                <p className="text-slate-600 mt-1">Processo identificado na instituição, mas que ainda não teve seu mapeamento concluído ou iniciado.</p>
              </div>
              {/* Exemplo de como adicionar um novo termo */}
              {/* 
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-lg font-bold text-slate-800">Novo Termo</h3>
                <p className="text-slate-600 mt-1">Descrição do novo termo aqui.</p>
              </div> 
              */}
            </div>
          </div>
        )}

        {activeTab === 'mapeamento' && (
          <>
            {/* Filters */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase mb-5">Opções de Filtros:</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">Ano</label>
              <div className="relative">
                <select 
                  className="w-full appearance-none bg-[#f8fafc] border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={ano} onChange={e => setAno(e.target.value)}
                >
                  {anos.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">Pró-Reitoria</label>
              <div className="relative">
                <select 
                  className="w-full appearance-none bg-[#f8fafc] border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={proReitoria} onChange={e => { setProReitoria(e.target.value); setSetor('Todos'); }}
                >
                  {proReitorias.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">Setor</label>
              <div className="relative">
                <select 
                  className="w-full appearance-none bg-[#f8fafc] border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={setor} onChange={e => setSetor(e.target.value)}
                >
                  {setores.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">Status</label>
              <div className="relative">
                <select 
                  className="w-full appearance-none bg-[#f8fafc] border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={status} onChange={e => setStatus(e.target.value)}
                >
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">Total Mapeados</p>
              <p className="text-4xl font-black text-slate-900">{totalMapeados}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#eff6ff] flex items-center justify-center text-[#2563eb]">
              <FileText size={28} />
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">Total Existentes</p>
              <p className="text-4xl font-black text-slate-900">{totalExistentes}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#f0fdf4] flex items-center justify-center text-[#16a34a]">
              <Files size={28} />
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">% Mapeados</p>
              <p className="text-4xl font-black text-slate-900">
                {totalExistentes > 0 ? Math.round((totalMapeados / totalExistentes) * 100) : 0}%
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#faf5ff] flex items-center justify-center text-[#9333ea]">
              <Percent size={28} />
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">Setores Envolvidos</p>
              <p className="text-4xl font-black text-slate-900">{new Set(filteredData.map(d => d.setor)).size}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#fff7ed] flex items-center justify-center text-[#ea580c]">
              <Building2 size={28} />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
          {/* Evolução por Ano */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-8">Evolução por Ano</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart3Data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} domain={[0, 100]} dx={-10} />
                  <Tooltip formatter={(value) => `${value}%`} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Line type="monotone" dataKey="percentage" stroke="#2563eb" strokeWidth={3} dot={{r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}}>
                    <LabelList dataKey="percentage" position="top" formatter={(val: number) => `${val}%`} fill="#64748b" fontSize={11} offset={12} />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Processos por Ano e Status */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-8">Processos por Ano e Status</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart1Data} margin={{ top: 20, right: 0, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dx={-10} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend iconType="circle" verticalAlign="top" wrapperStyle={{ paddingBottom: '20px' }} />
                  <Bar dataKey="Existentes" fill="#cbd5e1" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    <LabelList dataKey="Existentes" position="top" fill="#64748b" fontSize={11} />
                  </Bar>
                  <Bar dataKey="Mapeados" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    <LabelList dataKey="Mapeados" position="top" fill="#64748b" fontSize={11} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Processos Mapeados por Setor */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-800 mb-8">Processos Mapeados por Setor</h3>
            <div className="h-[400px] overflow-y-auto pr-2">
              <ResponsiveContainer width="100%" height={Math.max(400, chart2Data.length * 40)}>
                <BarChart data={chart2Data} layout="vertical" margin={{ top: 5, right: 40, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} width={100} dx={-10} />
                  <Tooltip cursor={{fill: '#f8fafc'}} formatter={(value) => `${value}%`} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="percentage" radius={[0, 4, 4, 0]} barSize={20}>
                    {
                      chart2Data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.percentage === 100 ? '#10b981' : entry.percentage > 0 ? '#f59e0b' : '#cbd5e1'} />
                      ))
                    }
                    <LabelList dataKey="percentage" position="right" formatter={(val: number) => `${val}%`} fill="#64748b" fontSize={11} offset={10} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        </>
        )}
      </main>
    </div>
  );
}
