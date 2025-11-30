'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import './TextEditor.css';

interface TextEditorProps {
    initialContent?: string;
    onChange?: (html: string, text: string) => void;
    className?: string;
}

const TextEditor = ({ initialContent = '', onChange, className }: TextEditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
        ],
        content: initialContent,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[500px] p-4',
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            const text = editor.getText({ blockSeparator: '\n' });
            onChange?.(html, text);
        },
    });

    useEffect(() => {
        if (editor && initialContent) {
            // Convert plain text to HTML with proper line breaks
            const htmlContent = initialContent
                .split('\n')
                .map(line => {
                    if (line.trim().startsWith('## ')) {
                        return `<h2>${line.replace('## ', '')}</h2>`;
                    } else if (line.trim() === '---') {
                        return '<hr>';
                    } else if (line.trim() === '') {
                        return '<p></p>';
                    } else {
                        return `<p>${line}</p>`;
                    }
                })
                .join('');

            editor.commands.setContent(htmlContent);
        }
    }, [initialContent, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className={cn("border-0 bg-background my-day-editor", className)}>
            <EditorContent editor={editor} />
        </div>
    );
};

export default TextEditor;
