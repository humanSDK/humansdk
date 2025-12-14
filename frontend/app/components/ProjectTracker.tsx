"use client"
import io from 'socket.io-client';
import React, { useState, useCallback, DragEvent, useRef, useEffect } from 'react'
import ReactFlow, {
  Node,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow'
import 'reactflow/dist/style.css'

import TaskNode from './TaskNode'
import AppSidebar from './AppSidebar'
import NoteNode from './NoteNode'
import { Button } from "@/components/ui/button"
import { PlusCircle, Trash2 } from 'lucide-react'
import { SOCKET_SERVICE_API, USER_SERVICE_API } from '@/constant'
import { useProjectMembers } from '@/components/context/ProjectMemberContext';
import axiosInstances from '@/utils/axiosInstance';
import { getSessionExpiredCallback } from '@/utils/sessionManager';
import axios from 'axios';
import { useNotification } from '@/components/context/NotificationContext';

const nodeTypes = {
  task: TaskNode,
  note: NoteNode,
}

interface ProjectTrackerProp {
  projectId: string;
  pageId: string;
}

const ProjectTracker = ({ projectId, pageId }: ProjectTrackerProp) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [isDragging, setIsDragging] = useState(false)
  const deleteAreaRef = useRef<any>(null)
  const { getNodes, getEdges } = useReactFlow()
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)  // Store the timeout ID
  const socketRef = useRef<any>(null)
  const isRemoteUpdateRef = useRef(false)  // Flag to track if update is from server
  const { fetchProjectMembers, fetchProjectDetails } = useProjectMembers();
  const { logActivity } = useNotification();
  // Function to add onChange handler to nodes
  const addOnChangeToNodes = useCallback((nodes: Node[]) => {
    return nodes.map(node => {
      // Preserve the existing data structure
      const nodeData = { ...node.data }

      // Add/update the onChange handler
      return {
        ...node,
        data: {
          ...nodeData,
          onChange: (id: string, newData: any) => {
            updateNodeData(id, newData)
          }
        }
      }
    })
  }, [])

  const fetchCanvas = async () => {
    try {
      const response = await axiosInstances.CoreService.get('/canvas', {
        params: {
          projectId,
          pageId,
        },
      });

      if (response.data.canvas) {
        const nodesWithOnChange = addOnChangeToNodes(response.data.canvas.nodes || []);
        isRemoteUpdateRef.current = true;  // Set flag before updating state
        setNodes(nodesWithOnChange);
        setEdges(response.data.canvas.edges || []);
        setTimeout(() => {
          isRemoteUpdateRef.current = false;
        }, 1000);
      }
    } catch (error) {
      console.error('Error fetching canvas data:', error);
    }
  };



  const establishSocketConnection = (projectId: string, roomId: string) => {
    try {
      const token = localStorage.getItem('ct_token')

      const newSocket = io(SOCKET_SERVICE_API, {
        transports: ['websocket'],
        query: { token, projectId: projectId }
      });

      socketRef.current = newSocket;

      // Emit the "join_canvas" event when the socket connects
      newSocket.on('connect', () => {
        newSocket.emit('join_canvas', roomId);
      });

      newSocket.on('canvas_updated', (data) => {
        if (data.edges && data.nodes) {
          const nodesWithOnChange = addOnChangeToNodes(data.nodes)
          isRemoteUpdateRef.current = true  // Set flag before updating state
          setNodes(nodesWithOnChange)
          setEdges(data.edges)
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
            establishSocketConnection(projectId, roomId);

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
        newSocket.emit('disconnect');  // Optionally send a disconnect event before disconnecting
        newSocket.close(); // Close the connection
      };
    } catch (error) {
      console.log("Failed to conenct to socker server:", error)
    }
  }

  // Fetching canvas on page load
  useEffect(() => {
    if (projectId && pageId) {
      fetchCanvas()
      establishSocketConnection(projectId, pageId)
      fetchProjectMembers(projectId)
      fetchProjectDetails(projectId)
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [projectId, pageId])

  useEffect(() => {
    // Skip if the update is from the server
    if (isRemoteUpdateRef.current) {
      return
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      const currentNodes = getNodes()
      const currentEdges = getEdges()

      // Emit to socket
      if (currentEdges.length != 0 || currentNodes.length != 0)
        if (socketRef.current) {
          socketRef.current.emit('save_canvas', {
            projectId,
            pageId,
            nodes: currentNodes,
            edges: currentEdges
          });
        }
    }, 1000)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [nodes, edges, projectId, pageId])


  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds))
    },
    [setEdges],
  )

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()

      const reactFlowBounds = event.currentTarget.getBoundingClientRect()
      const type = event.dataTransfer.getData('application/reactflow')

      if (typeof type === 'undefined' || !type) {
        return
      }

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      }

      const newNode: Node = {
        id: `${type}-${nodes.length + 1}`,
        type: 'task',
        position,
        data: {
          label: `New ${type}`,
          status: 'Not Started',
          type,
          assignees: [],
          onChange: (id: string, data: any) => updateNodeData(id, data)
        },
      }
      logActivity({
        entityType: 'project',
        entityId: projectId,
        action: 'created',
        changes: {
          taskName: newNode.data.label,
          projectId,
          pageId
        }
      });
      setNodes((nds) => nds.concat(newNode))
    },
    [nodes, setNodes, projectId, logActivity]
  )
  useEffect(() => {
    if (projectId && pageId) {
      fetchCanvas();
      establishSocketConnection(projectId, pageId);
      fetchProjectMembers(projectId);
      logActivity({
        entityType: 'project',
        entityId: projectId,
        action: 'opened canvas',
        changes: { projectId, pageId }
      });
    }
  }, [projectId, pageId]);
  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          // Create a new data object without the onChange property
          const { ...restData } = node.data
          logActivity({
            entityType: 'project',
            entityId: projectId,
            action: 'updated',
            changes: {
              taskName: newData.label || node.data.label,
              projectId,
              pageId,
              status: newData.status || node.data.status
            }
          });
          return {
            ...node,
            data: {
              ...restData,
              ...newData,
              onChange: (id: string, data: any) => updateNodeData(id, data)
            }
          }
        }
        return node
      })
    )
  }, [setNodes, projectId, logActivity]);

  const addNote = useCallback(() => {
    const newNote: Node = {
      id: `note-${nodes.length + 1}`,
      type: 'note',
      position: { x: 100, y: 100 },
      data: {
        text: 'New note',
        color: '#ffffff',
        onChange: (id: string, data: any) => updateNodeData(id, data)
      },
    }
    setNodes((nds) => nds.concat(newNote))
  }, [nodes, setNodes])

  const onNodeDragStart = useCallback(() => {
    setIsDragging(true)
  }, [])

  const onNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
    setIsDragging(false)
    if (deleteAreaRef.current) {
      const deleteAreaBounds = deleteAreaRef.current.getBoundingClientRect()
      if (
        event.clientX > deleteAreaBounds.left &&
        event.clientX < deleteAreaBounds.right &&
        event.clientY > deleteAreaBounds.top &&
        event.clientY < deleteAreaBounds.bottom
      ) {
        logActivity({
          entityType: 'project',
          entityId: projectId,
          action: 'deleted',
          changes: {
            taskName: node.data.label,
            projectId,
            pageId
          }
        });
        setNodes((nds) => nds.filter((n) => n.id !== node.id))
        setEdges((eds) => eds.filter((edge) => edge.source !== node.id && edge.target !== node.id))
      }
    }
  }, [setNodes, setEdges, projectId, logActivity]);

  // Use effect to track nodes and edges changes and log the latest state
  // useEffect(() => {
  //   const canvasState = {
  //     nodes: getNodes(),
  //     edges: getEdges(),
  //   }
  //   console.log('Canvas state updated:', JSON.stringify(canvasState, null, 2))

  //   if (saveTimeoutRef.current) {
  //     clearTimeout(saveTimeoutRef.current)
  //   }

  //   // Set a new timeout
  //   saveTimeoutRef.current = setTimeout(() => {
  //     saveCanvas()  // Call the saveCanvas function after a delay
  //   }, 1000)  // Delay of 1 second after the last change

  //   return () => {
  //     if (saveTimeoutRef.current) {
  //       clearTimeout(saveTimeoutRef.current)
  //     }
  //   }
  // }, [nodes, edges, saveCanvas])

  return (
    <div className="flex h-screen w-full">
      <AppSidebar projectId={projectId} pageId={pageId} pageType='canvas' />
      <div className="flex-grow h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onNodeDragStart={onNodeDragStart}
          onNodeDragStop={onNodeDragStop}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
        <Button
          className="absolute top-4 right-4 z-10"
          onClick={addNote}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add Note
        </Button>
        {isDragging && (
          <div
            ref={deleteAreaRef}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white p-2 rounded-full flex items-center justify-center"
          >
            <Trash2 className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  )
}

export const ProjectTrackerWrapper = ({ projectId, pageId }: ProjectTrackerProp) => {
  return (
    <ReactFlowProvider>
      <ProjectTracker projectId={projectId} pageId={pageId} />
    </ReactFlowProvider>
  )
}
