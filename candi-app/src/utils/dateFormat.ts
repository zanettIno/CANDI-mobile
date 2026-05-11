export const formatRelativeDate = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'agora';
  if (diffMin < 60) return `${diffMin}min`;
  if (diffHour < 24) return `${diffHour}h`;
  if (diffDay === 1) return 'ontem';
  if (diffDay < 7) return `${diffDay}d`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

export const formatTime = (isoString: string): string => {
  const clean = isoString.split('#')[0];
  return new Date(clean).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};
