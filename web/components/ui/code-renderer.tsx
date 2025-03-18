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
    const regex = /```(\w+)?\s([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;

    text.replace(regex, (match, lang, code, index) => {
        parts.push(text.slice(lastIndex, index)); // Push text before the code block
        parts.push(
            <pre key={index} className={`language-${lang || "plaintext"}`}>
                <code className={`language-${lang || "plaintext"}`}>{code.trim()}</code>
            </pre>
        );
        lastIndex = index + match.length;
        return match;
    });

    parts.push(text.slice(lastIndex)); // Push remaining text
    return parts;
};

const CodeRenderer = ({ text }: { text: string }) => {
    usePrismHighlight(); // Ensure syntax highlighting is applied after render

    return <div className="prose max-w-none">{formatCodeBlocks(text)}</div>;
};

export default CodeRenderer;
