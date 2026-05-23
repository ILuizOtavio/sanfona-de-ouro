import { stickers } from "../data/stickers";

const STORAGE_KEY = "sanfona-de-ouro-progress";

export type LocalProgress = {
  unlockedStickerIds: string[];
  duplicateStickerIds: string[];
  usedRewardIds: string[];
  pointsVisited: number;
  score: number;
};

export const initialProgress: LocalProgress = {
  unlockedStickerIds: ["luiz-gonzaga", "forro-caju", "mercado-municipal"],
  duplicateStickerIds: ["forro-caju", "mercado-municipal"],
  usedRewardIds: [],
  pointsVisited: 3,
  score: 320
};

export function loadProgress(): LocalProgress {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    saveProgress(initialProgress);
    return initialProgress;
  }

  return { ...initialProgress, ...JSON.parse(raw) };
}

export function saveProgress(progress: LocalProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function unlockRandomSticker() {
  const progress = loadProgress();
  const locked = stickers.filter((sticker) => !progress.unlockedStickerIds.includes(sticker.id));
  const pool = locked.length > 0 ? locked : stickers;
  const picked = pool[Math.floor(Math.random() * pool.length)];
  const isDuplicate = progress.unlockedStickerIds.includes(picked.id);

  const next: LocalProgress = {
    ...progress,
    unlockedStickerIds: isDuplicate ? progress.unlockedStickerIds : [...progress.unlockedStickerIds, picked.id],
    duplicateStickerIds: isDuplicate ? [...progress.duplicateStickerIds, picked.id] : progress.duplicateStickerIds,
    pointsVisited: progress.pointsVisited + 1,
    score: progress.score + (picked.rarity === "brilhante" ? 180 : picked.rarity === "rara" ? 120 : 70)
  };

  saveProgress(next);
  return { progress: next, sticker: picked, isDuplicate };
}

export function simulateTrade() {
  const progress = loadProgress();
  const locked = stickers.filter((sticker) => !progress.unlockedStickerIds.includes(sticker.id));
  const nextSticker = locked[0];

  const next: LocalProgress = nextSticker
    ? {
        ...progress,
        unlockedStickerIds: [...progress.unlockedStickerIds, nextSticker.id],
        duplicateStickerIds: progress.duplicateStickerIds.slice(1),
        score: progress.score + 90
      }
    : {
        ...progress,
        duplicateStickerIds: progress.duplicateStickerIds.slice(1),
        score: progress.score + 30
      };

  saveProgress(next);
  return next;
}

export function redeemReward(rewardId: string) {
  const progress = loadProgress();
  const next: LocalProgress = {
    ...progress,
    usedRewardIds: progress.usedRewardIds.includes(rewardId)
      ? progress.usedRewardIds
      : [...progress.usedRewardIds, rewardId],
    score: progress.score + 25
  };
  saveProgress(next);
  return next;
}
