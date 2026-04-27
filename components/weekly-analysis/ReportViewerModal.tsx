import React from 'react';
import { WeeklyAnalysis } from '../../types';

interface ReportViewerModalProps {
    analysis: WeeklyAnalysis;
    onClose: () => void;
}

const ReportViewerModal: React.FC<ReportViewerModalProps> = ({ analysis, onClose }) => {
    return (
        <div className="fixed inset-0 z-[300] bg-slate-950 flex flex-col animate-fade-in">
            {/* Toolbar */}
            <div className="flex justify-between items-center p-4 md:p-6 bg-[#111827] border-b border-white/5">
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="bg-blue-600 px-4 py-1.5 md:px-6 md:py-2 rounded-xl font-black text-white text-[10px] md:text-xs tracking-widest uppercase italic shadow-lg shadow-blue-600/20">
                        IAPRIORI INTEL
                    </div>
                    <div className="hidden sm:block h-8 w-px bg-white/10"></div>
                    <div className="min-w-0">
                        <h3 className="text-sm md:text-xl font-black text-white uppercase tracking-tighter leading-none truncate">
                            SEMANA {analysis.semana} • {analysis.año}
                        </h3>
                        <p className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 truncate">Análisis por: {analysis.autor}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    <button
                        onClick={() => window.print()}
                        className="hidden md:flex px-6 h-12 items-center bg-white/5 border border-white/10 rounded-2xl text-blue-400 font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                    >
                        Imprimir
                    </button>
                    <button
                        onClick={onClose}
                        className="w-11 h-11 md:w-12 md:h-12 flex items-center justify-center bg-rose-600 rounded-2xl text-white shadow-xl shadow-rose-600/30 active:scale-95 transition-all"
                    >
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>

            {/* Iframe Contenedor del Informe */}
            <div className="flex-1 bg-white overflow-hidden shadow-2xl">
                <iframe
                    title="Reporte Semanal"
                    className="w-full h-full border-none"
                    srcDoc={`
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                      html { zoom: 0.9; }
                      body { padding: 20px; margin: 0; font-family: sans-serif; }
                      @media (min-width: 768px) { body { padding: 40px; } }
                    </style>
                  </head>
                  <body>
                    ${analysis.analisisEjecutivo}
                  </body>
                </html>
              `}
                />
            </div>
        </div>
    );
};

export default ReportViewerModal;
