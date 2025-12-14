"use client"
import React, { useState, useEffect } from 'react';
import { Plus, FileText, ChevronDown, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import axiosInstances from '@/utils/axiosInstance';
const PageMenu = ({ projectId, pageId }: { projectId: string, pageId: string }) => {
    const [openMenus, setOpenMenus] = useState({ Pages: true });
    const [pages, setPages] = useState<any>([]);
    const [editingPage, setEditingPage] = useState<number | null>(null);
    const [pageInput, setPageInput] = useState('');
    const [activePage, setActivePage] = useState<string | null>(pageId);


    const toggleMenu = (menu: any) => {
        setOpenMenus((prev: any) => ({ ...prev, [menu]: !prev[menu] }));
    };


    const fetchPages = async () => {
        try {
            const response = await axiosInstances.CoreService.get('/page/list', {
                params: { projectId },  // Send projectId as a query parameter
            });
            if (response.data.pages) {
                setPages(response.data.pages);
            }
        } catch (error) {
            console.error('Error fetching pages:', error);
        }
    };

    const addPage = async () => {
        const new_page_count = pages.length + 1;
        try {
            const response = await axiosInstances.CoreService.post('/page/create',
                { pageName: `Page ${new_page_count}` },
                {
                    params: { projectId },  // Send projectId as a query parameter
                }
            );
            if (response.data) {
                fetchPages(); // Re-fetch after adding the page
            }
        } catch (error) {
            console.error('Error adding page:', error);
        }
    };

    const startEditing = (index: number) => {
        setEditingPage(index);
        setPageInput(pages[index].name);
    };

    const savePageName = async (index: number) => {
        if (pageInput.trim()) {
            try {
                const response = await axiosInstances.CoreService.put('/page',
                    {
                        pageId: pages[index]._id,
                        newPageName: pageInput,
                    },
                    {
                        params: { projectId },  // Send projectId as a query parameter
                    }
                );
                if (response.data) {
                    fetchPages(); // Re-fetch after renaming the page
                }
            } catch (error) {
                console.error('Error saving page name:', error);
            }
        }
        setEditingPage(null);
    };

    const handleBlur = (index: number) => savePageName(index);

    const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
        if (event.key === 'Enter') {
            savePageName(index);
        }
    };

    const handlePageClick = (page: any) => {
        console.log("-->", activePage)
        if (editingPage === null) {
            setActivePage(page._id);
            window.location.href = `/console/projects/${projectId}-${page._id}`;
        }
    };

    const handleRename = (index: number) => {
        startEditing(index);
    };

    const handleDelete = async (index: number) => {
        try {
            const response = await axiosInstances.CoreService.delete('/page', {
                params: {
                    projectId,
                    pageId: pages[index]._id,
                },
            });
            if (response.data) {
                fetchPages(); // Re-fetch after deleting the page
            }
        } catch (error) {
            console.error('Error deleting page:', error);
        }
    };


    useEffect(() => {
        fetchPages();
    }, [projectId]);

    return (
        <div className="mb-4">
            <div className="flex items-center justify-between cursor-pointer mb-2">
                <div className="flex items-center" onClick={() => toggleMenu('Pages')}>
                    <FileText className="h-5 w-5 mr-2" />
                    <span className="text-md font-medium">Pages</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Plus
                        className="h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700"
                        onClick={addPage}
                    />
                    <ChevronDown
                        className={`h-5 w-5 transform transition-transform ${openMenus.Pages ? 'rotate-180' : 'rotate-0'}`}
                        onClick={() => toggleMenu('Pages')}
                    />
                </div>
            </div>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                    height: openMenus.Pages ? 'auto' : 0,
                    opacity: openMenus.Pages ? 1 : 0,
                }}
                className="overflow-hidden"
            >
                <div className="space-y-2 pl-4">
                    {pages.map((page: any, index: any) => (
                        <div
                            key={index}
                            className="flex items-center justify-between space-x-2 relative group"
                        >
                            <div
                                className={`text-sm cursor-pointer hover:text-gray-700 `}
                                onClick={() => handlePageClick(page)}
                            >
                                {editingPage === index ? (
                                    <input
                                        type="text"
                                        value={pageInput}
                                        onChange={(e) => setPageInput(e.target.value)}
                                        onBlur={() => handleBlur(index)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        className="border rounded p-1 text-sm w-full"
                                        autoFocus
                                    />
                                ) : (
                                    <span>{page.name}</span>
                                )}
                            </div>

                            {/* ShadCN Dropdown Menu, shown on hover */}
                            <DropdownMenu>
                                <DropdownMenuTrigger className="invisible group-hover:visible">
                                    <MoreHorizontal className="h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-32">
                                    <DropdownMenuItem onClick={() => handleRename(index)} className='cursor-pointer'>
                                        Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDelete(index)} className='cursor-pointer'>
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

export default PageMenu;
