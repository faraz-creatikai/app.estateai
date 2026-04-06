"use client";

import { useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";

export default function TinyEditor({ value, onChange }: any) {
  const editorRef = useRef<any>(null);

  // ========== ALL YOUR MENTION + COMMENTS + AI LOGIC HERE ==========

  const user_id = "james-wilson";
  const collaborator_id = "mia-andersson";

  const now = new Date();
  const amomentago = new Date(now.getTime() - 30 * 1000).toISOString();
  const oneminuteago = new Date(now.getTime() - 1 * 60 * 1000).toISOString();

  const conversationDb: any = {
    "mce-conversation_19679600221621399703915": {
      uid: "mce-conversation_19679600221621399703915",
      comments: [
        {
          uid: "mce-conversation_19679600221621399703915",
          author: user_id,
          authorName: "James Wilson",
          authorAvatar:
            "https://sneak-preview.tiny.cloud/demouserdirectory/images/employee_james-wilson_128_52f19412.jpg",
          content:
            'Do we want to say "rich text editor" or "WYSIWYG editor" here?',
          createdAt: oneminuteago,
          modifiedAt: oneminuteago,
        },
        {
          uid: "mce-conversation_19679600221621399703917",
          author: collaborator_id,
          authorName: "Mia Andersson",
          authorAvatar:
            "https://sneak-preview.tiny.cloud/demouserdirectory/images/employee_mia-andersson_128_e6f9424b.jpg",
          content: "I think \"rich text editor\" works ok.",
          createdAt: amomentago,
          modifiedAt: amomentago,
        },
      ],
    },
  };

  const fakeDelay = 300;

  const randomString = () =>
    crypto.getRandomValues(new Uint32Array(1))[0]
      .toString(36)
      .substring(2, 14);

  // ========== TINY COMMENTS HANDLERS ==========
  const tinycomments_create = (req: any, done: any, fail: any) => {
    const uid = "annotation-" + randomString();

    conversationDb[uid] = {
      uid,
      comments: [
        {
          uid,
          author: user_id,
          authorName: "James Wilson",
          authorAvatar:
            "https://sneak-preview.tiny.cloud/demouserdirectory/images/employee_james-wilson_128_52f19412.jpg",
          content: req.content,
          createdAt: req.createdAt,
          modifiedAt: req.createdAt,
        },
      ],
    };
    setTimeout(() => done({ conversationUid: uid }), fakeDelay);
  };

  const tinycomments_reply = (req: any, done: any) => {
    const replyUid = "annotation-" + randomString();
    conversationDb[req.conversationUid].comments.push({
      uid: replyUid,
      author: user_id,
      authorName: "James Wilson",
      authorAvatar:
        "https://sneak-preview.tiny.cloud/demouserdirectory/images/employee_james-wilson_128_52f19412.jpg",
      content: req.content,
      createdAt: req.createdAt,
      modifiedAt: req.createdAt,
    });
    setTimeout(() => done({ commentUid: replyUid }), fakeDelay);
  };

  const tinycomments_fetch = (uids: any, done: any) => {
    const res: any = {};
    uids.forEach((uid: any) => {
      if (conversationDb[uid]) res[uid] = conversationDb[uid];
    });
    setTimeout(() => done({ conversations: res }), fakeDelay);
  };

  // ===========================================================

  return (
    <Editor
      apiKey="no-api-key"
      onInit={(evt, editor) => (editorRef.current = editor)}
      initialValue={value}
      onEditorChange={(html) => onChange(html)}
      init={{
        height: 600,
        menubar: "file edit view insert format tools table tc help",

        plugins: [
          "preview", "powerpaste", "searchreplace", "autolink",
          "autosave", "directionality", "visualblocks", "visualchars",
          "fullscreen", "link", "media", "codesample", "table",
          "lists", "checklist", "wordcount", "tinymcespellchecker",
          "a11ychecker", "help", "quickbars", "emoticons",
          "advtable", "footnotes", "mergetags",
          "tinycomments", "mentions"
        ],

        toolbar:
          "undo redo | bold italic | " +
          "alignleft aligncenter alignright | bullist numlist | " +
          "link table | addcomment showcomments",

        content_style: `
          span.mymention{ color: gray; }
          div.card { width: 240px; padding: 8px; border:1px solid #ddd; border-radius:3px;}
          div.card img.avatar { width:48px;height:48px;float:left;margin-right:8px; }
        `,

        tinycomments_mode: "embedded",
        tinycomments_create,
        tinycomments_reply,
        tinycomments_fetch,
      }}
    />
  );
}
