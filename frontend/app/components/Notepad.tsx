"usec client"

import { SOCKET_SERVICE_API, USER_SERVICE_API } from '@/constant'
import io from 'socket.io-client';
import axiosInstances from '@/utils/axiosInstance';
import AppSidebar from './AppSidebar'
import NotepadEditor from './NotepadEditor'
import { useEffect, useRef, useState } from 'react';
import { getSessionExpiredCallback } from '@/utils/sessionManager';
import axios from 'axios';

interface NotepadProp {
    projectId: string;
    noteId: string;
}

const Notepad = ({ projectId, noteId }: NotepadProp) => {
    const [note, setNote] = useState<any>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)  // Store the timeout ID
    const socketRef = useRef<any>(null)
    const isRemoteUpdateRef = useRef(false)

    const fetchNoteData = async (projectId: string, noteId: string) => {
        try {
            // Use the CoreService axios instance to make the request
            const response = await axiosInstances.CoreService.get('/note', {
                params: {
                    projectId,
                    noteId,
                },
            });

            // Handle the response as you did in the fetch function
            if (response.data.error === false && response.data.note) {
                console.log("note data:", response.data);
                setNote(response.data.note);
                setTimeout(() => {
                    isRemoteUpdateRef.current = false;
                }, 1500);
            }
        } catch (error) {
            console.error('Error fetching note data:', error);
        }
    };

    const establishSocketConnection = (projectId: string, noteId: string) => {
        try {
            const token = localStorage.getItem('ct_token')

            const newSocket = io(SOCKET_SERVICE_API, {
                transports: ['websocket', 'polling'],
                query: { token, projectId, noteId },
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            socketRef.current = newSocket;

            // Emit the "join_note" event when the socket connects
            newSocket.on('connect', () => {
                newSocket.emit('join_note', noteId);
            });

            newSocket.on('note_updated', (data) => {
                console.log("Asnan-->", data)
                if (data.note.editorContent) {
                    setNote(data.note)
                    isRemoteUpdateRef.current = true;
                    // Reset flag after a short delay to ensure state updates are complete
                    setTimeout(() => {
                        isRemoteUpdateRef.current = false
                    }, 10)
                }
            });

            newSocket.on("connect_error", async (err) => {
                console.error("Socket connection error:", err.message);
                if (err.message === "Authentication error: Token Expired") {
                    try {
                        const refreshResponse = await await axios.get(`${USER_SERVICE_API}/auth/new-auth-token`, {
                            headers: { Authorization: `Bearer ${localStorage.getItem('rt_token')}` },
                        });;

                        const newToken = refreshResponse.data.token;
                        localStorage.setItem("ct_token", newToken);

                        // Retry the socket connection with the new token
                        establishSocketConnection(projectId, noteId);

                    } catch (refreshError) {
                        console.error("Token refresh failed:", refreshError);
                        // Trigger session expired callback if token refresh fails
                        const sessionExpiredCallback = getSessionExpiredCallback();
                        if (sessionExpiredCallback) {
                            sessionExpiredCallback(); // Call the global session expired handler
                        }
                    }
                }
            });

            // Clean up the socket connection on component unmount
            return () => {
                newSocket.emit('disconnect_note');  // Optionally send a disconnect event before disconnecting
                newSocket.close(); // Close the connection
            };
        } catch (error) {
            console.log("Failed to conenct to socker server:", error)
        }
    }

    useEffect(() => {
        console.log("--p-->", projectId, "---n-->", noteId)
        if (noteId && projectId) {
            fetchNoteData(projectId, noteId)
            establishSocketConnection(projectId, noteId);
        }
        return () => {
            if (socketRef.current) {
                socketRef.current.close()
            }
        }
    }, [noteId, projectId])

    useEffect(() => {
        // Skip if the update is from the server
        if (isRemoteUpdateRef.current) {
            return
        }

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
        }

        saveTimeoutRef.current = setTimeout(() => {
            // Emit to socket
            if (note && note.editorContent)
                if (socketRef.current) {
                    socketRef.current.emit('save_note', {
                        projectId,
                        noteId,
                        editorContent: note.editorContent
                    });
                }
        }, 1000)

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current)
            }
        }
    }, [note, projectId])


    return (
        <div className="flex h-screen w-full">
            <AppSidebar projectId={projectId} pageId={noteId} pageType={"notepad"} />
            <div className="flex-grow h-screen overflow-y-scroll relative">
                {
                    note ?
                        <NotepadEditor noteId={noteId} noteContent={note.editorContent}
                            setEditorContent={(content: any) =>
                                setNote((prev: any) => ({ ...prev, editorContent: content }))
                            } />
                        :
                        <div className="flex flex-col justify-center h-screen items-center gap-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <p className="text-sm text-muted-foreground">We are fetching your notes...</p>
                        </div>
                }
            </div>
        </div>
    )
}

export default Notepad;