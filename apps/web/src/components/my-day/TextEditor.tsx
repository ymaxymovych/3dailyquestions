'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TextEditorProps {
    initialContent?: string;
    onChange?: (html: string, text: string) => void;
    className?: string;
}

const TextEditor = ({ initialContent = '', onChange, className }: TextEditorProps) => {
    const [value, setValue] = useState(initialContent);

    useEffect(() => {
        setValue(initialContent);
    }, [initialContent]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        setValue(text);
        onChange?.(text, text);
    };

    return (
        <textarea
            className={cn(
                "w-full h-full p-4 resize-none border-0 focus:outline-none focus:ring-0",
                "font-sans text-base leading-relaxed",
                className
            )}
            value={value}
            onChange={handleChange}
            placeholder="Почніть писати ваш план на день..."
        />
    );
};

export default TextEditor;
