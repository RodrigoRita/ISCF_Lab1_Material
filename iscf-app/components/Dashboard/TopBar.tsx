import React from "react";

export const TopBar = () => {
  // Cria uma nova data
  const today = new Date();

  // dia da semana
  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(today);

  return (
    <div className="border-b px-4 mb-4 mt-2 pb-4 border-stone-200">
      <div className="flex items-center justify-between p-0.5">
        <div>
          <span className="text-sm font-bold block">📊ISRC💼✨</span>
          <span className="text-xs block text-stone-500">
          📅{formattedDate}
          </span>
        </div>
      </div>
    </div>
  );
};
