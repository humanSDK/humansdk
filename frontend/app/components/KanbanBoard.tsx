// KanbanBoard.tsx
"use client";

import React from "react";

import { useProjectMembers } from '@/components/context/ProjectMemberContext';

import KanbanCard from "./KanbanCard";


const taskColors: any = {
    'Feature': 'bg-[#E6F3FF]',
    'Bug': 'bg-[#FFE6E6]',
    'Deployment': 'bg-[#E6FFF3]',
    'Documentation': 'bg-[#FFF3E6]',
    'Testing': 'bg-[#F3E6FF]',
    'Design': 'bg-[#FFE6F3]',
    'Research': 'bg-[#E6FFFA]',
    'Optimization': 'bg-[#FFFDE6]',
    'Refactoring': 'bg-[#E6F9FF]',
    'Meeting': 'bg-[#F3FFE6]',
}

const KanbanBoard = ({ nodesData, onUpdate, onRemove }: { nodesData: any; onUpdate: any; onRemove: any }) => {

    const columns = {
        "Not Started": nodesData.filter((node: any) => node.data.status === "Not Started"),
        "In Progress": nodesData.filter((node: any) => node.data.status === "In Progress"),
        "In Review": nodesData.filter((node: any) => node.data.status === "In Review"),
        "Completed": nodesData.filter((node: any) => node.data.status === "Completed"),
    };
    const { members, projectDetails } = useProjectMembers();
    console.log("--->", members)


    const handleDrop = (e: any, newStatus: any) => {
        e.preventDefault();
        const nodeId = e.dataTransfer.getData("nodeId");

        const updatedNodes = nodesData.map((node: any) =>
            node.id === nodeId
                ? { ...node, data: { ...node.data, status: newStatus } }
                : node
        );

        onUpdate(updatedNodes);
    };

    const handleDragOver = (e: any) => {
        e.preventDefault();
    };



    const getTypeColor = (type: any) => {
        const color = taskColors[type] || '#F3F3F3'; // Default color if type doesn't match
        return `${color} text-gray-800`; // Applying the background color dynamically
    };
    const getNodeBorderColor = (status: string) => {
        switch (status) {
            case "Not Started":
                return "border-b-2 border-b-gray-300";
            case "In Progress":
                return "border-b-2 border-b-blue-500";
            case "In Review":
                return "border-b-2 border-b-orange-500";
            case "Completed":
                return "border-b-2 border-b-green-500";
            default:
                return "border-b-2 border-b-gray-300";
        }
    };

    const getColumnBackgroundColor = (status: string) => {
        switch (status) {
            case "Not Started":
                return "bg-gray-200";
            case "In Progress":
                return "bg-blue-100";
            case "In Review":
                return "bg-orange-100";
            case "Completed":
                return "bg-green-100";
            default:
                return "bg-gray-100";
        }
    };
    return (
        <div className="p-4">
            <div className="grid grid-cols-4 gap-4">
                {Object.entries(columns).map(([status, items]) => (
                    <div
                        key={status}
                        className={`p-4 h-screen border-l-2`}
                        onDrop={(e) => handleDrop(e, status)}
                        onDragOver={handleDragOver}
                    >
                        <h2
                            className={`font-semibold mb-4 ${getColumnBackgroundColor(
                                status
                            )} p-2 rounded text-center`}
                        >
                            {status}
                        </h2>
                        <div className="space-y-3">
                            {items.map((node: any) => (
                                <KanbanCard
                                    key={node.id}
                                    node={node}
                                    members={members}
                                    projectDetails={projectDetails}
                                    getTypeColor={getTypeColor}
                                    getNodeBorderColor={getNodeBorderColor}
                                    onRemove={onRemove}
                                    onUpdate={onUpdate}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KanbanBoard;
