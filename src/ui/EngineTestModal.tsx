import React, { useState, useEffect } from 'react';
import { runAllStrategyUnitTests, TestResultItem } from '../domain/__tests__/strategyEngine.test.ts';
import { CheckCircle2, XCircle, Play, RefreshCw, X, ShieldCheck } from 'lucide-react';

interface EngineTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EngineTestModal: React.FC<EngineTestModalProps> = ({ isOpen, onClose }) => {
  const [results, setResults] = useState<TestResultItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const executeTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runAllStrategyUnitTests();
      setResults(res);
      setIsRunning(false);
    }, 150);
  };

  useEffect(() => {
    if (isOpen && results.length === 0) {
      executeTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  const allPassed = totalCount > 0 && passedCount === totalCount;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tests-title"
    >
      <div className="relative w-full max-w-2xl bg-[#0F172A] border border-slate-700/80 rounded-xl shadow-2xl p-6 text-slate-200 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="tests-title" className="text-base font-bold text-white font-mono">
                  Strategy Engine Test Suite
                </h2>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                    allPassed
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {passedCount} / {totalCount} Passed
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated verification of all 14 mandatory strategy, ranking &amp; real-time requirements
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={executeTests}
              disabled={isRunning}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>Rerun Tests</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close test suite"
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Test List */}
        <div className="overflow-y-auto flex-1 space-y-2.5 pr-1 text-xs font-mono">
          {results.map((test) => (
            <div
              key={test.id}
              className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-lg flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-2.5">
                {test.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">
                      #{test.id}. {test.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                      {test.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
                    {test.assertionMessage}
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-slate-500 tabular-nums shrink-0">
                {test.durationMs}ms
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
