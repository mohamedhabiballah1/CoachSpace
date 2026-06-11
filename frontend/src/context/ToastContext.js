import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const dismiss = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const colorMap = {
    success: 'border-[#c8f135] text-[#c8f135]',
    error:   'border-[#e85d4a] text-[#e85d4a]',
    info:    'border-[#888] text-[#888]',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            onClick={() => dismiss(t.id)}
            className={`pointer-events-auto flex items-center gap-3 bg-[#1a1a1a] border rounded-[6px] px-4 py-3 shadow-xl text-[13px] font-['DM_Sans'] min-w-[260px] max-w-[360px] cursor-pointer animate-slide-in ${colorMap[t.type] || colorMap.info}`}
          >
            <span className="text-[18px]">
              {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
            </span>
            <span className="flex-1 text-[#f0ede6]">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
