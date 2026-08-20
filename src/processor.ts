// ============================================
// PROCESSOR — Filtra y calcula estadísticas
// ============================================

import type { Campaign, CampaignSummary } from './types.js';

export function filterByChannel(
  campaigns: Campaign[],
  channelFilter: string | null
): Campaign[] {
  if (channelFilter === null) {
    return campaigns;
  }

  const normalized = channelFilter.toLowerCase();
  const filtered = campaigns.filter(
    (c) => c.channel.toLowerCase() === normalized
  );

  if (filtered.length === 0) {
    const available = [...new Set(campaigns.map((c) => c.channel))];
    throw new Error(
      `No hay campañas en el canal "${channelFilter}". Canales disponibles: ${available.join(', ')}`
    );
  }

  return filtered;
}

export function calculateSummary(campaigns: Campaign[]): CampaignSummary {
  const total = campaigns.length;
  const active = campaigns.filter((c) => c.active).length;
  const inactive = total - active;

  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const averageBudget = Math.round((totalBudget / total) * 100) / 100;

  const sortedByBudget = [...campaigns].sort((a, b) => b.budget - a.budget);
  const mostExpensive = sortedByBudget[0];
  const cheapest = sortedByBudget[sortedByBudget.length - 1];

  const channels = [...new Set(campaigns.map((c) => c.channel))];

  return {
    total,
    active,
    inactive,
    averageBudget,
    mostExpensive,
    cheapest,
    channels,
  };
}