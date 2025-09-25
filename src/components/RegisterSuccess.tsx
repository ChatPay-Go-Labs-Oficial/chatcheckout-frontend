import React from 'react';

interface RegisterSuccessProps {
  countdown: number;
  showLoader: boolean;
}

export default function RegisterSuccess({ countdown, showLoader }: RegisterSuccessProps) {
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
          Redirecionando para login
        </span>
        <span className="text-3xl font-bold text-[#181b4a] mt-1 animate-pulse">{countdown}s</span>
      </div>
    </div>
  );
}
