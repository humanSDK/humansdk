"use client"
import React, { useState, useEffect } from 'react';
import { Plus, File, ChevronDown, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import axiosInstances from '@/utils/axiosInstance';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

const NoteMenu = ({ projectId, noteId }: { projectId: string, noteId: string }) => {
    const [openMenus, setOpenMenus] = useState({ Notes: true });
    const [notes, setNotes] = useState<any>([]);
    const [editingNote, setEditingNote] = useState<number | null>(null);
    const [noteInput, setNoteInput] = useState('');
    const [activeNote, setActiveNote] = useState<string | null>(noteId);

    const toggleMenu = (menu: any) => {
        setOpenMenus((prev: any) => ({ ...prev, [menu]: !prev[menu] }));
    };
    const fetchNotes = async () => {
        try {
            const response = await axiosInstances.CoreService.get('/note/list', {
                params: { projectId },  // Send projectId as a query parameter
            });
            if (response.data.notes) {
                setNotes(response.data.notes);
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    };

    const addNote = async () => {
        const new_note_count = notes.length + 1;
        try {
            const response = await axiosInstances.CoreService.post('/note/create',
                { noteName: `Note ${new_note_count}` },
                {
                    params: { projectId },  // Send projectId as a query parameter
                }
            );
            if (response.data) {
                fetchNotes(); // Refresh notes after adding a new one
            }
        } catch (error) {
            console.error('Error adding note:', error);
        }
    };

    const startEditing = (index: number) => {
        setEditingNote(index);
        setNoteInput(notes[index].name);
    };

    const saveNoteName = async (index: number) => {
        if (noteInput.trim()) {
            try {
                const response = await axiosInstances.CoreService.put('/note',
                    {
                        noteId: notes[index]._id,
                        newNoteName: noteInput,
                    },
                    {
                        params: { projectId },  // Send projectId as a query parameter
                    }
                );
                if (response.data) {
                    fetchNotes(); // Refresh notes after saving the name
                }
            } catch (error) {
                console.error('Error saving note name:', error);
            }
        }
        setEditingNote(null);
    };

    const handleBlur = (index: number) => saveNoteName(index);

    const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
        if (event.key === 'Enter') {
            saveNoteName(index);
        }
    };

    const handleNoteClick = (note: any) => {
        if (editingNote === null) {
            setActiveNote(note._id);
            window.location.href = `/console/projects/notepad/${projectId}-${note._id}`;
        }
    };

    const handleRename = (index: number) => {
        startEditing(index);
    };

    const handleDelete = async (index: number) => {
        try {
            const response = await axiosInstances.CoreService.delete('/note', {
                params: {
                    projectId,
                    noteId: notes[index]._id,
                },
            });
            if (response.data) {
                fetchNotes(); // Refresh notes after deletion
            }
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };


    useEffect(() => {
        fetchNotes();
    }, [projectId]);

    return (
        <div className="mb-4">
            <div className="flex items-center justify-between cursor-pointer mb-2">
                <div className="flex items-center" onClick={() => toggleMenu('Notes')}>
                    <File className="h-5 w-5 mr-2" />
                    <span className="text-md font-medium">Notes</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Plus
                        className="h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700"
                        onClick={addNote}
                    />
                    <ChevronDown
                        className={`h-5 w-5 transform transition-transform ${openMenus.Notes ? 'rotate-180' : 'rotate-0'}`}
                        onClick={() => toggleMenu('Notes')}
                    />
                </div>
            </div>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                    height: openMenus.Notes ? 'auto' : 0,
                    opacity: openMenus.Notes ? 1 : 0,
                }}
                className="overflow-hidden"
            >
                <div className="space-y-2 pl-4">
                    {notes.map((note: any, index: any) => (
                        <div
                            key={index}
                            className={`flex items-center justify-between space-x-2 relative group rounded-md
                                ${note._id === activeNote ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-900'}`}
                        >
                            <div
                                className="text-sm cursor-pointer hover:text-gray-700 flex-grow"
                                onClick={() => handleNoteClick(note)}
                            >
                                {editingNote === index ? (
                                    <input
                                        type="text"
                                        value={noteInput}
                                        onChange={(e) => setNoteInput(e.target.value)}
                                        onBlur={() => handleBlur(index)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        className="border rounded p-1 text-sm w-full"
                                        autoFocus
                                    />
                                ) : (
                                    <span className="truncate">{note.name}</span>
                                )}
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger className="invisible group-hover:visible">
                                    <MoreHorizontal className="h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-32">
                                    <DropdownMenuItem onClick={() => handleRename(index)} className="cursor-pointer">
                                        Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleDelete(index)}
                                        className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                                    >
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default NoteMenu;