import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 価格フォーマット用共通関数
export function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`
}
