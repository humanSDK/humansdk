import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star, Bug, Rocket, FileText, ShieldCheck, Paintbrush, Search,
  Zap, RefreshCw, Users, Settings, ChevronDown,
  LayoutGrid,
  ChartNoAxesCombined
} from 'lucide-react';
import PageMenu from './PageMenu';
import NoteMenu from './NotepadMenu';
import Link from 'next/link';
const taskTypes = [
  { type: 'Feature', icon: Star },
  { type: 'Bug', icon: Bug },
  { type: 'Deployment', icon: Rocket },
  { type: 'Documentation', icon: FileText },
  { type: 'Testing', icon: ShieldCheck },
  { type: 'Design', icon: Paintbrush },
  { type: 'Research', icon: Search },
  { type: 'Optimization', icon: Zap },
  { type: 'Refactoring', icon: RefreshCw },
  { type: 'Meeting', icon: Users },
];

interface AppSidebarProp {
  projectId: string;
  pageId?: string;
  pageType: string;
  addNodeOnClick?: any;
}

const AppSidebar = ({ projectId, pageId, pageType, addNodeOnClick = null }: AppSidebarProp) => {
  const [openMenus, setOpenMenus] = useState({
    Components: true,
    Pages: true,
  });

  const toggleMenu = (menu: any) => {
    setOpenMenus((prev: any) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    if (pageType == "canvas") {
      event.dataTransfer.setData('application/reactflow', nodeType);
      event.dataTransfer.effectAllowed = 'move';
    }
    if (pageType == "sprintboard" && addNodeOnClick) {
      addNodeOnClick(nodeType);
    }
  };


  return (
    <aside className="w-64 bg-gray-100 p-4 overflow-y-auto">
      {/* Components Menu */}
      <div className="mb-4">
        <div
          className="flex items-center justify-between cursor-pointer mb-2"
          onClick={() => toggleMenu('Components')}
        >
          <div className="flex items-center">
            <Rocket className="h-5 w-5 mr-2" />
            <span className="text-md font-medium">Components</span>
          </div>
          <ChevronDown
            className={`h-5 w-5 transform transition-transform ${openMenus.Components ? 'rotate-180' : 'rotate-0'}`}
          />
        </div>
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: openMenus.Components ? 'auto' : 0,
            opacity: openMenus.Components ? 1 : 0,
          }}
          className="overflow-hidden"
        >
          <div className="grid grid-cols-2 gap-2">
            {taskTypes.map(({ type, icon: Icon }) => (
              <div
                key={type}
                draggable
                onDragStart={(event) => onDragStart(event, type)}
                className="bg-white rounded-lg shadow p-2 flex flex-col items-center cursor-grab"
              >
                <Icon className="h-6 w-6 mb-1 text-gray-700" />
                <span className="text-xs text-center">{type}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Pages Menu */}
      <PageMenu projectId={projectId} pageId={pageId ?? ''} />

      <div className="mb-4">
        <Link href={`/console/projects/sprint-board/${projectId}`} className={`flex items-center `}>
          <LayoutGrid className="h-5 w-5 mr-2" />
          <span className="text-md font-medium">Sprint Board</span>
        </Link>
      </div>

      <NoteMenu projectId={projectId} noteId={pageId ?? ''} />



      {/* In-app Inbox */}
      <div className="mb-4">
        <Link href={`/console/projects/analytics/${projectId}`} className={`flex items-center`}>
          <ChartNoAxesCombined className="h-5 w-5 mr-2" />
          <span className="text-md font-medium">Analytics</span>
        </Link>
      </div>



      {/* Settings */}
      <div className="mb-4">
        <div className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          <span className="text-md font-medium">Settings</span>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
