// ─── Notification Type Utilities ─────────────────────────────────────────────
// Edit this file to update icons, colors, and links across ALL pages.

import { ComponentType, ReactNode } from "react";
import { BsFillPersonPlusFill } from "react-icons/bs";
import { IoPersonSharp } from "react-icons/io5";
import { RiUserFollowFill } from "react-icons/ri";

type IconType = string | ComponentType<any>;

const map: Record<string, IconType> = {
  CUSTOMER_CREATED: IoPersonSharp,
  NEW_USER_REQUEST: RiUserFollowFill,
  CUSTOMER_FOLLOWUP_TAKEN: RiUserFollowFill,
  ORDER_PLACED: "🛒",
  PAYMENT_RECEIVED: "💳",
  ALERT: "⚠️",
  ERROR: "🚨",
};

export function getTypeIcon(type: string): IconType {
  return map[type] ?? "🔔";
}

export interface TypeConfig {
  icon: string | ComponentType<any>;
  color: string;
  bg: string;
}

export function getTypeConfig(type: string): TypeConfig {
  const map: Record<string, TypeConfig> = {
    CUSTOMER_CREATED: {
      icon:  IoPersonSharp,
      color: "text-[var(--color-primary)]",
      bg:    "bg-[var(--color-primary-lighter)]",
    },
    CUSTOMER_FOLLOWUP_TAKEN: {
      icon:  RiUserFollowFill,
      color: "text-[var(--color-secondary)]",
      bg:    "bg-[var(--color-secondary-lighter)]",
    },
    NEW_USER_REQUEST: {
      icon:  BsFillPersonPlusFill,
      color: "text-sky-600",
      bg:    "bg-sky-50",
    },
    ORDER_PLACED: {
      icon:  "🛒",
      color: "text-emerald-600",
      bg:    "bg-emerald-50",
    },
    PAYMENT_RECEIVED: {
      icon:  "💳",
      color: "text-violet-600",
      bg:    "bg-violet-50",
    },
    ALERT: {
      icon:  "⚠️",
      color: "text-amber-600",
      bg:    "bg-amber-50",
    },
    ERROR: {
      icon:  "🚨",
      color: "text-[var(--color-destructive)]",
      bg:    "bg-red-50",
    },
  };
  return map[type] ?? {
    icon:  "🔔",
    color: "text-[var(--color-gray)]",
    bg:    "bg-gray-100",
  };
}

/**
 * Maps notification type → destination URL.
 * Returns null for informational-only notifications (no navigation on click).
 */
export function getTypeLink(type: string, entityId: string): string | null {
  switch (type) {
    case "CUSTOMER_CREATED":  return `/customers/${entityId}`;
    case "CUSTOMER_FOLLOWUP_TAKEN":  return `/followups/customer`;
    case "NEW_USER_REQUEST":  return `/masters/newuser-requests`;
    case "ORDER_PLACED":      return `/orders/${entityId}`;
    case "PAYMENT_RECEIVED":  return `/payments/${entityId}`;
    case "ALERT":             return `/alerts`;
    case "ERROR":             return `/logs`;
    default:                  return null;
  }
}