import { disconnectAccount, getInstagramLivePosts } from "@/store/social-media/socialMedia";
import { ApiResponse, PlatformModuleConfig } from "../../page";


// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM: INSTAGRAM
// Move this entire block to:  platforms/instagram/index.tsx
// ─────────────────────────────────────────────────────────────────────────────


export function createInstagramModule(): PlatformModuleConfig {
const fetchPosts = async (): Promise<ApiResponse> => {
  const res = await getInstagramLivePosts();
  if (res) return res;
  return { success: false, posts: [] };
};

  const connect = (adminId: string) => {
    const clientId = process.env.NEXT_PUBLIC_FB_APP_ID;
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;
     const url =
        `https://www.facebook.com/v19.0/dialog/oauth` +
        `?client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri!)}` +
         `&scope=pages_show_list,pages_read_engagement,pages_read_user_content,pages_manage_posts,instagram_basic,instagram_content_publish,instagram_manage_insights,business_management` + 
        `&response_type=code` +
        `&auth_type=rerequest` +   // FORCE PERMISSION SCREEN
        `&state=${clientId}`;
    window.location.href = url;
  };

  /**
   * Calls your existing disconnectAccount API helper.
   * Import it from wherever it lives in your project, e.g.:
   *   import { disconnectAccount } from "@/lib/api/instagram";
   */
const disconnect = async (): Promise<boolean> => {
  const res = await disconnectAccount();
  if (res) return res?.success;
  return false;
};

  return {
    id: "instagram",
    name: "Instagram",
    defaultStatus: "not_connected",
    color: "linear-gradient(135deg,#f58529,#dd2a7b,#8134af)",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
    setupSteps: [
      {
        number: 1,
        title: "Create a Facebook Page",
        description:
          "Instagram Graph API requires a Facebook Page linked to your account. Go to facebook.com/pages/create and set up a Business Page for your brand. You need admin access to this page.",
        docUrl: "https://www.facebook.com/pages/create",
      },
      {
        number: 2,
        title: "Convert Instagram to Business / Creator",
        description:
          'Open Instagram app → tap your profile → Settings → Account → "Switch to Professional Account". Choose Business or Creator, pick a category, and complete the setup. A personal account cannot use the Graph API.',
        docUrl: "https://help.instagram.com/502981923235522",
      },
      {
        number: 3,
        title: "Link Instagram to Your Facebook Page",
        description:
          'In Instagram: Settings → Account → "Linked Accounts" → Facebook — log in and pick your Page. Alternatively go to your Facebook Page Settings → Instagram → Connect Account.',
        docUrl: "https://help.instagram.com/176235449218188",
      },
      {
        number: 4,
        title: "Connect via Instagram Graph API",
        description:
          'All set! Click "Connect Instagram" below. You\'ll be redirected to Facebook OAuth to grant the required permissions. After authorizing, your posts will load here automatically.',
      },
    ],
    fetchPosts,
    connect,
    disconnect,
  };
}