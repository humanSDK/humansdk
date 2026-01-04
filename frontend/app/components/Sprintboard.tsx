
// SprintBoard.tsx
"use client";
import io from 'socket.io-client';

import { SOCKET_SERVICE_API, USER_SERVICE_API } from "@/constant";
import { useProjectMembers } from "@/components/context/ProjectMemberContext";
import { useEffect, useRef, useState } from "react";
import AppSidebar from "./AppSidebar";
import KanbanBoard from "./KanbanBoard";
import axiosInstances from '@/utils/axiosInstance';
import { getSessionExpiredCallback } from '@/utils/sessionManager';
import axios from 'axios';

interface SprintBoardProp {
    projectId: string;
}

const SprintBoard = ({ projectId }: SprintBoardProp) => {
    const { fetchProjectMembers, fetchProjectDetails } = useProjectMembers();
    const [kanbanData, setKanbanData] = useState<any>([]);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)  // Store the timeout ID

    const socketRef = useRef<any>(null)
    const isRemoteUpdateRef = useRef(false)
    const fetchSprints = async (projectId: string) => {
        try {
            const response = await axiosInstances.CoreService.get('/sprint', {
                params: {
                    projectId,
                },
            });

            if (response.data.sprint) {
                setKanbanData(response.data.sprint.nodes);
                setTimeout(() => {
                    isRemoteUpdateRef.current = false;
                }, 1500);
            }
        } catch (error) {
            console.error('Error fetching sprint data:', error);
        }
    };

    // Flag to track if update is from server
    const establishSocketConnection = (projectId: string) => {
        try {
            const token = localStorage.getItem('ct_token')

            const newSocket = io(SOCKET_SERVICE_API, {
                transports: ['websocket', 'polling'],
                query: { token, projectId: projectId },
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            socketRef.current = newSocket;

            // Emit the "join_canvas" event when the socket connects
            newSocket.on('connect', () => {
                newSocket.emit('join_sprint', projectId);
            });

            newSocket.on('sprint_updated', (data) => {
                console.log("Asnan-->", data)
                if (data.nodes) {
                    setKanbanData(data.nodes)
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
                        establishSocketConnection(projectId);

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
                newSocket.emit('disconnect_sprint');  // Optionally send a disconnect event before disconnecting
                newSocket.close(); // Close the connection
            };
        } catch (error) {
            console.log("Failed to conenct to socker server:", error)
        }
    }
    useEffect(() => {
        if (projectId) {
            establishSocketConnection(projectId)
            fetchProjectMembers(projectId);
            fetchProjectDetails(projectId);
            fetchSprints(projectId)
        }
        return () => {
            if (socketRef.current) {
                socketRef.current.close()
            }
        }
    }, [projectId]);


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
            if (kanbanData.length > 0)
                if (socketRef.current) {
                    socketRef.current.emit('save_sprint', {
                        projectId,
                        nodes: kanbanData,
                    });
                }
        }, 1000)

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current)
            }
        }
    }, [kanbanData, projectId])


    const handleKanbanUpdate = (updatedData: any) => {

        console.log("on update-->", updatedData)

        setKanbanData(updatedData);
        // Optionally sync with API
    };
    const addNode = (newNodeType: string) => {
        const newNode = {
            id: `${newNodeType}-${kanbanData.length + 1}`,
            type: 'task',
            position: { x: 0, y: 0 },
            data: {
                label: `New ${newNodeType}`,
                status: 'Not Started',
                type: newNodeType,
                assignees: [],
                onChange: (id: string, data: any) => handleKanbanUpdate(data)
            },
        };
        setKanbanData([...kanbanData, newNode]);
    };

    const removeNode = (nodeId: string) => {
        const updatedNodes = kanbanData.filter((node: any) => node.id !== nodeId);
        setKanbanData(updatedNodes);
    };




    return (
        <div className="flex h-screen w-full">
            <AppSidebar projectId={projectId} pageType={"sprintboard"} addNodeOnClick={addNode} />
            <div className="flex-grow h-screen overflow-y-scroll relative">
                <KanbanBoard nodesData={kanbanData} onUpdate={handleKanbanUpdate} onRemove={removeNode} />
            </div>
        </div>
    );
};

export default SprintBoard;