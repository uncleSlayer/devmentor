"use client";

import React from "react";
import { useEffect } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-python";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";

export const usePrismHighlight = () => {
    useEffect(() => {
        Prism.highlightAll();
    }, []);
};

const formatCodeBlocks = (text: string) => {
    return text.replace(
        /```(\w+)?\s([\s\S]*?)```/g,
        (match, lang, code) => {
            const languageClass = lang ? `language-${lang}` : "language-plaintext";
            return `<pre><code class="${languageClass}">${code
                .trim()
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")}</code></pre>`;
        }
    );
};

const CodeRenderer = ({ text }: { text: string }) => {
    usePrismHighlight(); // Ensure syntax highlighting is applied after render

    return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: formatCodeBlocks(text) }} />;
};

export default CodeRenderer;
