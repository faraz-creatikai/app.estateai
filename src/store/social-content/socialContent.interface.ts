export interface MinedLeadPayload {
    source: SourceType
    author: string | null
    authorId: string | null
    title: string | null
    content: string
    url: string
    postContext: string | null
    postedAt: string | null
}

/* ═══════════════════════════════════════════════
   SOURCE TYPE
═══════════════════════════════════════════════ */
export type SourceType = 'reddit' | 'facebook' | 'instagram'


/* ═══════════════════════════════════════════════
   BASE SOCIAL POST (COMMON SHAPE)
═══════════════════════════════════════════════ */
export interface BasePost {
    author?: string | null
    title?: string | null
    text?: string | null
    url: string
}


/* ═══════════════════════════════════════════════
   REDDIT POST
═══════════════════════════════════════════════ */
export interface RedditPost extends BasePost {
    author?: string | null
    title?: string | null
    text?: string | null
    url: string

    subreddit?: string | null
}


/* ═══════════════════════════════════════════════
   FACEBOOK POST
═══════════════════════════════════════════════ */
export interface FacebookPost extends BasePost {
    author?: string | null
    authorId?: string | null
    title?: string | null
    text?: string | null
    url: string
    groupId?: string | null
    createdAt?: string | null
}


/* ═══════════════════════════════════════════════
   INSTAGRAM POST (future-proofing)
═══════════════════════════════════════════════ */
export interface InstagramPost extends BasePost {
    author?: string | null
    authorId?: string | null
    title?: string | null
    text?: string | null
    url: string
    groupId?: string | null
    createdAt?: string | null
    media?: string[]
}


/* ═══════════════════════════════════════════════
   UNION TYPE
═══════════════════════════════════════════════ */
export type SocialPost = RedditPost | FacebookPost | InstagramPost


/* ═══════════════════════════════════════════════
   API RESPONSE TYPE
═══════════════════════════════════════════════ */
export interface SaveLeadsResponse {
    saved: number
    duplicates: number
}


//minedlead save payload 

export const toLeadPayload = (post: SocialPost, source: SourceType): MinedLeadPayload => {
    if (source === 'reddit') {
        const r = post as RedditPost
        return {
            source,
            author: r.author ?? null,
            authorId: r.author ?? null,
            title: r.title ?? null,
            content: r.text ?? '',
            url: r.url,
            postContext: r.subreddit ?? null,
            postedAt: null,
        }
    }
    else if (source === "facebook") {
        const f = post as FacebookPost
        return {
            source,
            author: f.author ?? null,
            authorId: f.authorId ?? null,
            title: f.title ?? null,
            content: f.text ?? '',
            url: f.url,
            postContext: f.groupId ?? null,
            postedAt: f.createdAt ?? null,
        }
    }

    else {
        const f = post as InstagramPost
        return {
            source,
            author: f.author ?? null,
            authorId: f.authorId ?? null,
            title: f.title ?? null,
            content: f.text ?? '',
            url: f.url,
            postContext: f.groupId ?? null,
            postedAt: f.createdAt ?? null,
        }
    }
}