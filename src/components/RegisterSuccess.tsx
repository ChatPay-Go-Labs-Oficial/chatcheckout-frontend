import React from 'react';

interface RegisterSuccessProps {
  showLoader: boolean;
  message?: string;
  loading?: boolean;
}

const RegisterSuccess: React.FC<RegisterSuccessProps> = ({ showLoader, message, loading }) => {
  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <span className="text-[#181b4a] text-2xl sm:text-3xl font-extrabold text-center">
        Cadastro realizado com sucesso!
      </span>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#181b4a] via-[#6f43d0] to-[#6fdcff] animate-loaderBar"
          style={{ width: showLoader ? '100%' : '0%' }}
        />
      </div>
      <div className="flex flex-col items-center mt-2">
        <span className="text-[#6f43d0] text-lg font-semibold tracking-wide">
          {message || 'Preparando sua conta para você...'}
        </span>
        {loading && (
          <span className="text-3xl font-bold text-[#181b4a] mt-1 animate-pulse">Aguarde…</span>
        )}
      </div>
    </div>
  );
};

export default RegisterSuccess;
