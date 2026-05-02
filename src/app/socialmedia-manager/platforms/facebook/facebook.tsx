"use client";

import { getFacebookLivePosts, disconnectFacebookAccount } from "@/store/social-media/socialMedia";
import { ApiResponse, PlatformModuleConfig } from "../../page";


// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM: FACEBOOK
// ─────────────────────────────────────────────────────────────────────────────



export function createFacebookModule(): PlatformModuleConfig {
  const fetchPosts = async (): Promise<ApiResponse> => {
  const res = await getFacebookLivePosts();
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
  const res = await disconnectFacebookAccount();
  if (res) return res?.success;
  return false;
};

  return {
    id: "facebook",
    name: "Facebook",
    defaultStatus: "not_connected",
    color: "linear-gradient(135deg,#1877f2,#0a5dc2)",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),

    setupSteps: [
      {
        number: 1,
        title: "Create a Facebook App",
        description:
          "Go to developers.facebook.com → My Apps → Create App. Choose 'Business' type. Fill in the app name and contact email, then click Create App.",
        docUrl: "https://developers.facebook.com/docs/development/create-an-app",
      },
      {
        number: 2,
        title: "Add Facebook Login Product",
        description:
          "Inside your app dashboard, click '+ Add Product' and select 'Facebook Login'. Choose 'Web' as the platform and enter your site URL.",
        docUrl: "https://developers.facebook.com/docs/facebook-login/web",
      },
      {
        number: 3,
        title: "Configure OAuth Redirect URI",
        description:
          "In Facebook Login → Settings, add your OAuth redirect URI (e.g. https://yourdomain.com/api/auth/facebook/callback). Save changes.",
        docUrl: "https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow",
      },
      {
        number: 4,
        title: "Request Required Permissions",
        description:
          "In App Review → Permissions and Features, request: pages_show_list, pages_read_engagement, pages_manage_posts, and publish_to_groups (if needed). Submit for review.",
        docUrl: "https://developers.facebook.com/docs/permissions",
      },
      {
        number: 5,
        title: "Connect Your Page",
        description:
          "Copy your App ID and App Secret into the server environment variables. Then click Connect Facebook below to complete the OAuth flow and link your Facebook Page.",
      },
    ],
    fetchPosts,
    connect,
    disconnect,
  };
}


