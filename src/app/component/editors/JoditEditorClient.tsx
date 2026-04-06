"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

interface JoditEditorClientProps {
    value: string;
    onChange: (html: string) => void;
}

export default function JoditEditorClient({ value, onChange }: JoditEditorClientProps) {
    const [content, setContent] = useState(value || "");
    const editor = useRef<any>(null);
    const config = useMemo(
        () => ({
            readonly: false,
            placeholder: 'Start typing...',
            height: 'auto',
            minHeight: 300,
            uploader: { insertImageAsBase64URI: true },
            addButtons: ["brush"], 
        }),
        []
    );
    // Handle blur safely
    const handleBlur = useCallback(() => {
        if (editor.current) {
            const html = editor.current.value;
             // get current HTML
            setContent(html);                     // update local state
            onChange(html);                       // notify parent
        }
    }, [onChange]);

    // Handle onChange without losing focus
    const handleChange = useCallback(() => {
        if (editor.current) {
            const html = editor.current.value;
            // Optional: you can update local state too
            // setContent(html); 
            onChange(html); // notify parent
        }
    }, [onChange]);

    return (
        <div className="border border-gray-300 rounded-md overflow-hidden ">
            {/*  <JoditEditor
                value={content}
                config={{
                    readonly: false,
                    height: 'auto',
                    minHeight: 300,
                    placeholder: "Write your email body here...",
                    uploader: { insertImageAsBase64URI: true },
                }}
                onBlur={(newContent) => {
                    setContent(newContent);   // update local state
                    onChange(newContent);     // notify parent
                }}
            /> */}
            <JoditEditor
                ref={editor}
                value={content}
                config={config}
                onBlur={handleBlur}
                onChange={handleChange}
            />
        </div>
    );
}
