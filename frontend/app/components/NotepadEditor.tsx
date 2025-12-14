"use client"
import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { motion } from 'framer-motion';
import {
    Bold, Italic, Strikethrough, Code, Link as LinkIcon, List,
    ListOrdered, Quote, Heading1, Heading2, Undo, Redo, Check,
    Image as ImageIcon, Table as TableIcon, Grid, Trash2,
    Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';
import {
    Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const customStyles = `
        .ProseMirror {
            > * + * {
                margin-top: 0.75em;
            }
            
            ul {
                list-style-type: disc;
                padding-left: 1.5em;
                margin: 1em 0;
            }
            
            ul ul {
                list-style-type: circle;
            }
            
            ul ul ul {
                list-style-type: square;
            }
            
            ol {
                list-style-type: decimal;
                padding-left: 1.5em;
                margin: 1em 0;
            }
            
            ol ol {
                list-style-type: lower-alpha;
            }
            
            ol ol ol {
                list-style-type: lower-roman;
            }
            
            li {
                margin: 0.5em 0;
            }
            
            a {
                color: #2563eb;
                text-decoration: underline;
                cursor: pointer;
                transition: color 0.2s ease;
            }
            
            a:hover {
                color: #1d4ed8;
            }
            
            h1 {
                font-size: 2em;
                font-weight: bold;
                margin: 1em 0 0.5em;
                color: #111827;
                line-height: 1.2;
            }
            
            h2 {
                font-size: 1.5em;
                font-weight: bold;
                margin: 1em 0 0.5em;
                color: #111827;
                line-height: 1.2;
            }
            
            table {
                border-collapse: collapse;
                margin: 1em 0;
                width: 100%;
                table-layout: fixed;
            }
            
            th {
                background-color: #f3f4f6;
                font-weight: bold;
            }
            
            td, th {
                border: 2px solid #e5e7eb;
                padding: 0.5em;
                position: relative;
                vertical-align: top;
                min-width: 100px;
            }
            
            blockquote {
                border-left: 4px solid #e5e7eb;
                margin: 1em 0;
                padding: 0.5em 0 0.5em 1em;
                color: #4b5563;
                font-style: italic;
            }
            
            code {
                background-color: #f3f4f6;
                border-radius: 0.25em;
                padding: 0.2em 0.4em;
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                font-size: 0.9em;
            }
            
            pre {
                background-color: #1f2937;
                color: #f3f4f6;
                padding: 1em;
                border-radius: 0.5em;
                overflow-x: auto;
                margin: 1em 0;
            }
            
            pre code {
                background-color: transparent;
                padding: 0;
                color: inherit;
                font-size: 0.9em;
                line-height: 1.5;
            }
            
            img {
                max-width: 100%;
                height: auto;
                border-radius: 0.375em;
            }
            
            p {
                margin: 0.75em 0;
                line-height: 1.6;
            }
        }
        
        /* Dark mode styles */
        .dark .ProseMirror {
            color: #e5e7eb;
            
            h1, h2 {
                color: #f3f4f6;
            }
            
            th {
                background-color: #374151;
            }
            
            td, th {
                border-color: #4b5563;
            }
            
            blockquote {
                border-color: #4b5563;
                color: #9ca3af;
            }
            
            code {
                background-color: #374151;
                color: #e5e7eb;
            }
            
            a {
                color: #60a5fa;
            }
            
            a:hover {
                color: #93c5fd;
            }
        }
    `;

const NotepadEditor = ({ noteId, noteContent = "", setEditorContent }: any) => {
    const [linkUrl, setLinkUrl] = useState('');
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [showImageInput, setShowImageInput] = useState(false);
    const lowlight = createLowlight(common);

    console.log("NOTE ID:", noteId)

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false,
            }),
            Link.configure({
                openOnClick: false,
                linkOnPaste: true,
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            CodeBlockLowlight.configure({
                lowlight,
                defaultLanguage: 'javascript',
            }),
        ],
        content: noteContent ?? '',
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none max-w-none p-4 min-h-[500px]',
            },
        },
        onUpdate: ({ editor }) => {
            setEditorContent(editor.getHTML())
        },
    });

    useEffect(() => {
        if (editor && editor.getHTML() !== noteContent) {
            editor.commands.setContent(noteContent);
        }
    }, [noteContent, editor]);

    useEffect(() => {
        const styleSheet = document.createElement('style');
        styleSheet.type = 'text/css';
        styleSheet.innerText = customStyles;
        document.head.appendChild(styleSheet);

        return () => {
            document.head.removeChild(styleSheet);
        };
    }, []);



    const ToolbarButton = ({ onClick, active, icon, tooltip }: any) => (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`p-2 ${active ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
                        onClick={onClick}
                    >
                        {icon}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );

    const handleImageUpload = async (file: any) => {
        try {
            const reader: any = new FileReader();
            reader.onloadend = () => {
                editor?.chain().focus().setImage({ src: reader.result }).run();
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const insertTable = () => {
        editor?.chain().focus().insertTable({ rows: 3, cols: 3 }).run();
    };

    const addTableRow = () => {
        editor?.chain().focus().addRowAfter().run();
    };

    const addTableColumn = () => {
        editor?.chain().focus().addColumnAfter().run();
    };

    const deleteTableRow = () => {
        editor?.chain().focus().deleteRow().run();
    };

    const deleteTableColumn = () => {
        editor?.chain().focus().deleteColumn().run();
    };

    const deleteTable = () => {
        editor?.chain().focus().deleteTable().run();
    };
    if (!editor) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col w-full border rounded-lg shadow-sm bg-white dark:bg-slate-900"
        >
            <div className="flex flex-wrap items-center gap-1 p-2 border-b dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-900 z-10">
                {/* Text Formatting */}
                <div className="flex items-center gap-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        active={editor.isActive('bold')}
                        icon={<Bold className="h-4 w-4" />}
                        tooltip="Bold"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        active={editor.isActive('italic')}
                        icon={<Italic className="h-4 w-4" />}
                        tooltip="Italic"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        active={editor.isActive('strike')}
                        icon={<Strikethrough className="h-4 w-4" />}
                        tooltip="Strikethrough"
                    />
                </div>

                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />

                {/* Links and Code */}
                <div className="flex items-center gap-1">
                    <Popover open={showLinkInput} onOpenChange={setShowLinkInput}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`p-2 ${editor.isActive('link') ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
                            >
                                <LinkIcon className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <div className="flex space-x-2">
                                <Input
                                    type="url"
                                    placeholder="Enter URL"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    className="flex-1"
                                />
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        editor.chain().focus().setLink({ href: linkUrl }).run();
                                        setLinkUrl('');
                                        setShowLinkInput(false);
                                    }}
                                >
                                    <Check className="h-4 w-4" />
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        active={editor.isActive('code')}
                        icon={<Code className="h-4 w-4" />}
                        tooltip="Inline Code"
                    />
                </div>

                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />

                {/* Lists and Quotes */}
                <div className="flex items-center gap-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        active={editor.isActive('bulletList')}
                        icon={<List className="h-4 w-4" />}
                        tooltip="Bullet List"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        active={editor.isActive('orderedList')}
                        icon={<ListOrdered className="h-4 w-4" />}
                        tooltip="Numbered List"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        active={editor.isActive('blockquote')}
                        icon={<Quote className="h-4 w-4" />}
                        tooltip="Quote"
                    />
                </div>

                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />

                {/* Headings */}
                <div className="flex items-center gap-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        active={editor.isActive('heading', { level: 1 })}
                        icon={<Heading1 className="h-4 w-4" />}
                        tooltip="Heading 1"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        active={editor.isActive('heading', { level: 2 })}
                        icon={<Heading2 className="h-4 w-4" />}
                        tooltip="Heading 2"
                    />
                </div>

                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />

                {/* Images */}
                <div className="flex items-center gap-1">
                    <Popover open={showImageInput} onOpenChange={setShowImageInput}>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-2">
                                <ImageIcon className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <div className="space-y-2">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            handleImageUpload(e.target.files[0]);
                                            setShowImageInput(false);
                                        }
                                    }}
                                />
                                <div className="flex space-x-2">
                                    <Input
                                        type="url"
                                        placeholder="Or enter image URL"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            editor.chain().focus().setImage({ src: imageUrl }).run();
                                            setImageUrl('');
                                            setShowImageInput(false);
                                        }}
                                    >
                                        <Check className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />

                {/* Tables */}
                <div className="flex items-center gap-1">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-2">
                                <TableIcon className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="min-w-[180px]">
                            <DropdownMenuItem onClick={insertTable}>
                                <Grid className="h-4 w-4 mr-2" />
                                Insert Table
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={addTableRow}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Row Below
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={addTableColumn}>
                                <Plus className="h-4 w-4 mr-2" rotate={90} />
                                Add Column After
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={deleteTableRow}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Row
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={deleteTableColumn}>
                                <Trash2 className="h-4 w-4 mr-2" rotate={90} />
                                Delete Column
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={deleteTable} className="text-red-600 dark:text-red-400">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Table
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex-grow" />

                {/* Undo/Redo */}
                <div className="flex items-center gap-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        icon={<Undo className="h-4 w-4" />}
                        tooltip="Undo"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        icon={<Redo className="h-4 w-4" />}
                        tooltip="Redo"
                    />
                </div>
            </div>



            {/* Editor Content */}
            <EditorContent
                editor={editor}
                className="flex-grow"
            />
        </motion.div>
    );
};

export default NotepadEditor;