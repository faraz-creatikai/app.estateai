// ─── Toast Notification Popup ─────────────────────────────────────────────────

import { Notification } from "@/store/notifications/notifications.interface";
import { getTypeIcon, getTypeLink } from "@/store/notifications/notifications.utils";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";

const TOAST_DURATION = 10; // seconds — change this one number only
function NotificationToast({
  notification,
  onClose,
}: {
  notification: Notification | null;
  onClose: () => void;
}) {
  const RenderIcon = () => {
    const Icon = getTypeIcon(notification?.type || "");
    return typeof Icon === "string" ? <>{Icon}</> : <Icon />;
  };
    const router = useRouter();

return (
  <AnimatePresence>
    {notification && (
      <>
        {/* Dark backdrop — click to close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-[2px]"
        />

        {/* Toast card — centered */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-0 z-[9999] flex items-start justify-center mt-10 pointer-events-none"
        >
          <div className="w-[380px] max-w-[calc(100vw-2rem)] pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl border border-[var(--color-primary-light)] shadow-[0_20px_60px_rgba(0,102,204,0.2),0_4px_16px_rgba(0,0,0,0.1)] overflow-hidden">

              {/* Progress bar */}
              <motion.div
                className="h-0.5 bg-[var(--color-primary)]"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: TOAST_DURATION, ease: "linear" }}
              />

              <div className="flex items-start gap-3 px-4 py-4">
                {/* Icon */}
                <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm bg-[var(--color-primary-lighter)] text-[var(--color-primary)]">
                  <RenderIcon />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-gray-900 leading-snug">
                      {notification.title}
                    </p>
                    <button
                      onClick={onClose}
                      className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors mt-0.5"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                    {notification.message}
                  </p>

                  <div className="flex items-center justify-between mt-2.5">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-wider bg-[var(--color-primary-lighter)] text-[var(--color-primary-dark)] border border-[var(--color-primary-light)]">
                      {notification.entityType}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">just now</span>
                  </div>
                </div>
              </div>

              {/* Footer action */}
              {getTypeLink(notification.type, notification.entityId) && (
                <div className="px-4 pb-3.5">
                  <button
                    onClick={()=>{router.push(getTypeLink(notification.type, notification.entityId) || "/notifications"); onClose();}}
                    className="w-full py-2 text-xs font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] rounded-xl transition-colors"
                  >
                    View →
                  </button>
                </div>
              )}

            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);
}

export default NotificationToast;
export {TOAST_DURATION};