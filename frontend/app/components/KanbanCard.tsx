// KanbanCard.tsx
"use client";

import React, { useCallback, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, MoreVertical } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNotification } from './context/NotificationContext'
import { ProjectDetail } from "./context/ProjectMemberContext";

const KanbanCard = ({ node, members, projectDetails, getTypeColor, getNodeBorderColor, onRemove, onUpdate }: { node: any; members: any; projectDetails: ProjectDetail; getTypeColor: any; getNodeBorderColor: any; onRemove: any; onUpdate: any }) => {
    const [showOptions, setShowOptions] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedLabel, setEditedLabel] = useState(node.data.label);
    const [searchValue, setSearchValue] = useState('')
    const [popoverOpen, setPopoverOpen] = useState(false)
    const { sendMessage } = useNotification()

    const filteredAssignees = members
        .filter((assignee: any) =>
            assignee.userName.toLowerCase().includes(searchValue.toLowerCase())
        )
    // Ensure assignees is always an array
    const currentAssignees = Array.isArray(node.data?.assignees) ? node.data.assignees : []



    const handleAssigneeChange = useCallback(
        (assigneeEmail: any[]) => {
            const updatedNode = { ...node, data: { ...node.data, assignees: assigneeEmail } };

            // Ensure the full nodes list is updated
            onUpdate((prevNodes: any) =>
                prevNodes.map((n: any) => (n.id === node.id ? updatedNode : n))
            );
            setPopoverOpen(false)

            if (assigneeEmail[0]) {
                const notificationData = {
                    sendTo: assigneeEmail[0],
                    title: `${projectDetails.name} - Sprintboard`,
                    message: `${node.data.label} has been assigned to you.`,
                    link: window.location.href,
                };
                sendMessage(notificationData);
            }
        },
        [node, onUpdate]
    );
    const handleBlur = () => {
        if (editedLabel !== node.data.label) {
            const updatedNode = { ...node, data: { ...node.data, label: editedLabel } };

            // Ensure the full nodes list is updated
            onUpdate((prevNodes: any) =>
                prevNodes.map((n: any) => (n.id === node.id ? updatedNode : n))
            );
        }
        setIsEditing(false);
    };


    return (
        <Card
            key={node.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("nodeId", node.id)}
            className={`min-h-24 cursor-pointer hover:shadow-md transition-shadow ${getNodeBorderColor(
                node.data.status
            )} rounded-sm`}
        >
            <CardContent className="px-4 pt-4 pb-1">
                <div className="flex justify-between items-center relative">
                    <Badge className={getTypeColor(node.data.type)}>{node.data.type}</Badge>
                    <div
                        className="cursor-pointer"
                        onBlur={() => setShowOptions(false)}
                    >
                        <MoreVertical
                            className="w-4 h-4"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowOptions(!showOptions);
                            }}
                        />
                        {showOptions && (
                            <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
                                <div
                                    className="px-4 py-1 hover:bg-gray-100 cursor-pointer text-sm"
                                    onClick={() => alert("Move to Backlog")}
                                >
                                    Move to Backlog
                                </div>
                                <div
                                    className="px-4 py-1 hover:bg-gray-100 cursor-pointer text-sm"
                                    onClick={() => alert("Move to Next Sprint")}
                                >
                                    Move to Next Sprint
                                </div>
                                <div
                                    className="px-4 py-1 hover:bg-gray-100 cursor-pointer  text-sm text-red-600"
                                    onClick={() => onRemove(node.id)}
                                >
                                    Remove
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {isEditing ? (
                    <input
                        type="text"
                        value={editedLabel}
                        autoFocus
                        className="w-full mt-2 border-b-2 focus:outline-none"
                        onChange={(e) => setEditedLabel(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleBlur();
                            }
                        }}
                    />
                ) : (
                    <p
                        className="mt-2 font-medium cursor-pointer"
                        onClick={() => setIsEditing(true)}
                    >
                        {node.data.label}
                    </p>
                )}
                <div className="flex flex-row justify-between">
                    <div></div>
                    <div className="relative">
                        <div
                            className="cursor-pointer flex items-center  px-2 py-1 text-xs"
                            onClick={() => setPopoverOpen(prev => !prev)}
                        >
                            {currentAssignees.length > 0 ? (
                                <div className="flex items-center">
                                    <div className="flex -space-x-[14px]">
                                        {members
                                            .filter((member: any) => currentAssignees.includes(member.email))
                                            .slice(0, 5)
                                            .map((assignee: any, index: number) => (
                                                <Avatar
                                                    key={index}
                                                    className="h-8 w-8 border-2 border-white rounded-full"
                                                    style={{ zIndex: 5 - index }}
                                                >
                                                    <AvatarImage src={assignee.avatar} alt="User Avatar" />
                                                    <AvatarFallback>
                                                        {assignee.userName === "Unknown User"
                                                            ? assignee.email?.charAt(0).toUpperCase()
                                                            : assignee.userName?.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            ))}
                                    </div>
                                    {currentAssignees.length > 5 && (
                                        <span className="ml-2 flex items-center justify-center text-xs bg-gray-300 text-gray-700 rounded-full h-6 w-6">
                                            +{currentAssignees.length - 5}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <span className="pt-4">
                                    <span>
                                        No Assignee
                                    </span>
                                    <span className="ml-2 text-gray-500">&#9660;</span>
                                </span>
                            )}
                        </div>

                        {popoverOpen && (
                            <div
                                className="absolute top-full mt-2 w-60 bg-white shadow-lg rounded-md border border-gray-200 p-2 z-10"
                            >
                                <input
                                    type="text"
                                    placeholder="Search assignee..."
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    className="w-full p-1 mb-2 border rounded outline-none"
                                />
                                <div className="max-h-40 overflow-y-auto w-56 bg-white ">
                                    {filteredAssignees.map((assignee: any) => (
                                        <div
                                            key={assignee.email}
                                            className="flex justify-between items-center p-1 hover:bg-gray-50 cursor-pointer transition duration-200 ease-in-out"
                                            onClick={() => handleAssigneeChange([assignee.email])}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={assignee.avatar} alt="User Avatar" />
                                                    <AvatarFallback>
                                                        {assignee.userName === "Unknown User"
                                                            ? assignee.email?.charAt(0).toUpperCase()
                                                            : assignee.userName?.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm font-medium text-gray-800 truncate">
                                                    {assignee.userName === "Unknown User" ? assignee.email : assignee.userName}
                                                </span>
                                            </div>
                                            {currentAssignees.includes(assignee.email) && (
                                                <Check className="h-5 w-5 text-green-500" />
                                            )}
                                        </div>
                                    ))}
                                    {filteredAssignees.length === 0 && (
                                        <div className="text-sm text-gray-500 p-3">No assignee found.</div>
                                    )}
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default KanbanCard;