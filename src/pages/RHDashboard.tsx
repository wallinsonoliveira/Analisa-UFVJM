import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, CheckCircle, ArrowRightLeft, Info, FileText, Files, Percent, Building2, ChevronDown, Users, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
} from 'recharts';

export default function RHDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<ProcessRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'capa' | 'indicadores'>('capa');

  // Filters
  const [ano, setAno] = useState('Todos');
  const [proReitoria, setProReitoria] = useState('Todos');

  useEffect(() => {
    // In a real scenario, this would fetch a different CSV file, e.g., '/data-rh.csv'
    // For demonstration, we'll use the same data service but pretend it's RH data
    fetchData('/data.csv').then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  // Filter options
  const anos = ['Todos', '2021', '2022', '2023', '2024', '2025'];
  const proReitorias = ['Todos', ...Array.from(new Set(data.map(d => d.proReitoria))).sort()];

  // Filtered data
  const filteredData = useMemo(() => {
    return data.filter(d => {
      if (ano !== 'Todos' && d.ano !== ano) return false;
      if (proReitoria !== 'Todos' && d.proReitoria !== proReitoria) return false;
      return true;
    });
  }, [data, ano, proReitoria]);

  // Chart 1: Servidores por Ano (Mocking data based on the existing CSV)
  const chart1Data = useMemo(() => {
    const years = ano === 'Todos' ? ['2021', '2022', '2023', '2024', '2025'] : [ano];
    
    return years.map(y => {
      const yearData = filteredData.filter(d => d.ano === y);
      // Pretending "Mapeados" are "Docentes" and "Existentes" are "TAEs" for the sake of the demo
      const docentes = yearData.filter(d => d.status === 'Mapeados').reduce((sum, d) => sum + d.quantidade, 0) * 10;
      const taes = yearData.filter(d => d.status === 'Existentes').reduce((sum, d) => sum + d.quantidade, 0) * 15;
      return {
        name: y,
        Docentes: docentes,
        TAEs: taes
      };
    });
  }, [filteredData, ano]);

  const totalDocentes = useMemo(() => filteredData.filter(d => d.status === 'Mapeados').reduce((sum, d) => sum + d.quantidade, 0) * 10, [filteredData]);
  const totalTAEs = useMemo(() => filteredData.filter(d => d.status === 'Existentes').reduce((sum, d) => sum + d.quantidade, 0) * 15, [filteredData]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-slate-500">Carregando dados...</div>;
  }

  if (activeTab === 'capa') {
    return (
      <div className="min-h-screen bg-[#064e3b] relative overflow-hidden flex flex-col font-sans">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        <div className="relative z-10 flex flex-col min-h-screen p-8 lg:p-12">
          <div className="flex justify-between items-start w-full">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="Logo UFVJM" className="h-24 object-contain" />
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-black text-[#6ee7b7] tracking-widest leading-none">PROGEP</h2>
              <h2 className="text-4xl font-black text-white tracking-widest leading-none mt-1">UFVJM</h2>
            </div>
          </div>

          <div className="flex-1 flex items-center w-full max-w-7xl mx-auto mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">
              <div className="flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-white mb-12">Pró-Reitoria de Gestão de Pessoas</h3>
                <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">Painel de Recursos Humanos</h2>
                <p className="text-xl text-white/90 mb-16">Indicadores referentes ao quadro de servidores da instituição</p>
                
                <div className="inline-block" style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))' }}>
                  <button 
                    onClick={() => setActiveTab('indicadores')}
                    className="bg-[#e2e8f0] text-slate-900 font-bold text-xl py-4 flex items-center justify-center hover:bg-white transition-colors"
                    style={{ 
                      clipPath: 'polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%, 10% 50%)',
                      width: '280px'
                    }}
                  >
                    Ver Indicadores
                  </button>
                </div>
                <div className="mt-8">
                  <button 
                    onClick={() => navigate('/')}
                    className="text-white/80 hover:text-white flex items-center gap-2 transition-colors"
                  >
                    <ArrowLeft size={16} /> Voltar ao Portal
                  </button>
                </div>
              </div>

              <div className="flex flex-col justify-between relative h-full min-h-[500px]">
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-64 h-64 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                    <Users size={120} className="text-white/80" />
                  </div>
                </div>

                <div className="border border-white/30 p-5 text-xs text-white/90 mt-12 bg-[#064e3b]/60 backdrop-blur-md rounded-sm">
                  <p className="mb-1.5"><strong className="text-white">Elaboração:</strong> PROGEP</p>
                  <p className="mb-1.5"><strong className="text-white">Frequência de atualização:</strong> Mensal.</p>
                  <p className="mb-1.5"><strong className="text-white">Fonte de dados:</strong> SIAPE</p>
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
      <header className="bg-white px-8 py-6 flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center gap-4">
          <img src="/logo2.png" alt="Logo UFVJM" className="w-14 h-14 object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Painel de Recursos Humanos</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide uppercase mt-1">Indicadores do quadro de servidores da UFVJM</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar à Página Inicial
        </button>
      </header>

      <main className="max-w-[1400px] mx-auto px-8 py-8 space-y-8">
        <div className="flex gap-8 border-b border-slate-100">
          <button 
            onClick={() => setActiveTab('indicadores')}
            className={`flex items-center gap-2 pb-4 border-b-2 font-bold text-sm tracking-wide uppercase transition-colors ${activeTab === 'indicadores' ? 'border-[#059669] text-[#059669]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <Users size={18} />
            Quadro de Pessoal
          </button>
        </div>

        {activeTab === 'indicadores' && (
          <>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase mb-5">Opções de Filtros:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">Ano</label>
                  <div className="relative">
                    <select 
                      className="w-full appearance-none bg-[#f8fafc] border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      value={ano} onChange={e => setAno(e.target.value)}
                    >
                      {anos.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">Lotação</label>
                  <div className="relative">
                    <select 
                      className="w-full appearance-none bg-[#f8fafc] border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      value={proReitoria} onChange={e => setProReitoria(e.target.value)}
                    >
                      {proReitorias.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">Total de Servidores</p>
                  <p className="text-4xl font-black text-slate-900">{totalDocentes + totalTAEs}</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-[#ecfdf5] flex items-center justify-center text-[#059669]">
                  <Users size={28} />
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">Docentes</p>
                  <p className="text-4xl font-black text-slate-900">{totalDocentes}</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-[#eff6ff] flex items-center justify-center text-[#2563eb]">
                  <BookOpen size={28} />
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">Técnicos Administrativos</p>
                  <p className="text-4xl font-black text-slate-900">{totalTAEs}</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-[#fdf4ff] flex items-center justify-center text-[#c026d3]">
                  <Building2 size={28} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 pb-12">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-8">Evolução do Quadro por Ano</h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chart1Data} margin={{ top: 20, right: 0, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dx={-10} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Legend iconType="circle" verticalAlign="top" wrapperStyle={{ paddingBottom: '20px' }} />
                      <Bar dataKey="Docentes" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={60}>
                        <LabelList dataKey="Docentes" position="top" fill="#64748b" fontSize={11} />
                      </Bar>
                      <Bar dataKey="TAEs" fill="#c026d3" radius={[4, 4, 0, 0]} maxBarSize={60}>
                        <LabelList dataKey="TAEs" position="top" fill="#64748b" fontSize={11} />
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
