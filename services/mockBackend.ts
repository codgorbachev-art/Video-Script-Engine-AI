import { Limits } from "../types";

const FREE_DAILY_LIMIT = 2;

function getDateKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export const mockBackend = {
  getUserStatus: (): Limits => {
    const isPro = localStorage.getItem("app_is_pro") === "true";
    const dateKey = getDateKey();
    const usedToday = parseInt(localStorage.getItem(`usage_${dateKey}`) || "0", 10);
    
    return {
      isPro,
      dailyLimit: FREE_DAILY_LIMIT,
      usedToday,
      remainingToday: isPro ? 999999 : Math.max(0, FREE_DAILY_LIMIT - usedToday)
    };
  },

  consumeCredit: (): boolean => {
    const status = mockBackend.getUserStatus();
    if (status.isPro) return true;
    if (status.usedToday >= status.dailyLimit) return false;

    const dateKey = getDateKey();
    localStorage.setItem(`usage_${dateKey}`, (status.usedToday + 1).toString());
    return true;
  },

  subscribe: () => {
    localStorage.setItem("app_is_pro", "true");
  },

  cancelSubscription: () => {
    localStorage.removeItem("app_is_pro");
  }
};