import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Users, BarChart3, ArrowRight } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white px-8 py-6 flex justify-between items-center border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <img src="/logo2.png" alt="Logo UFVJM" className="h-14 object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Portal de Dashboards</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide uppercase mt-1">Universidade Federal dos Vales do Jequitinhonha e Mucuri</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-12">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Bem-vindo ao Portal de Indicadores</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Selecione um dos painéis abaixo para visualizar os dados e indicadores institucionais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Mapeamento de Processos */}
          <div 
            onClick={() => navigate('/processos')}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col h-full"
          >
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FileText size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Mapeamento de Processos</h3>
            <p className="text-slate-600 text-sm flex-grow mb-6">
              Indicadores referentes ao mapeamento de processos da UFVJM, incluindo status por pró-reitoria e evolução anual.
            </p>
            <div className="flex items-center text-blue-600 font-medium text-sm mt-auto">
              Acessar Painel <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Recursos Humanos (Exemplo) */}
          <div 
            onClick={() => navigate('/rh')}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:emerald-300 transition-all cursor-pointer group flex flex-col h-full"
          >
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Recursos Humanos</h3>
            <p className="text-slate-600 text-sm flex-grow mb-6">
              Painel demonstrativo com indicadores de pessoal, distribuição de servidores e evolução do quadro.
            </p>
            <div className="flex items-center text-emerald-600 font-medium text-sm mt-auto">
              Acessar Painel <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Em Breve */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 border-dashed flex flex-col items-center justify-center text-center h-full min-h-[250px] opacity-70">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-600 mb-2">Novo Painel</h3>
            <p className="text-slate-500 text-sm">
              Em breve novos indicadores estarão disponíveis.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
