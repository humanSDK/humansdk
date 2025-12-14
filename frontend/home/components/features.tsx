'use client'

import { motion } from "framer-motion"
import Image from 'next/image'
import chat from '@/components/images/chat.png'
import notes from '@/components/images/cos-theta-notes.png'
import springboard from '@/components/images/cos-theat-spb.png'
import analytics from '@/components/images/analaytics.png'
import TeamManage from '@/components/images/team-members-cos-theta.png'
const features = [

  {
    title: "TEAM CHAT",
    description: "Built-in chat interface for each project node. Attach files, share updates, and collaborate in real-time.",
    image: chat,
    details: `• Dedicated chat channels for each project and team
• Support for file attachments up to 5MB (images, documents, PDFs)
• Rich text formatting with markdown support
• Share code snippets with syntax highlighting
• Message threading for organized discussions
• Emoji reactions and quick responses
• Search through message history
• Pin important messages for easy reference
• Integrate with task updates and notifications`
  },
  {
    title: "MULTIPLE NOTES",
    description: "Create and organize multiple project pages with their own workflows and team assignments.",
    image: notes,
    details: `• Create unlimited project pages with unique layouts
• Organize pages in hierarchical structures
• Set different access permissions per page
• Use templates for quick page creation
• Add custom metadata and tags to pages
• Link related pages and create connections
• Version control for page content
• Export pages in multiple formats
• Schedule page archival and cleanup
• Integration with document management systems`
  },
  {
    title: "SPRINT BOARD",
    description: "Visualize your workflow with customizable sprint boards. Create, assign, and track tasks efficiently.",
    image: springboard,
    details: `• Fully customizable Kanban-style board with drag-and-drop functionality
• Create multiple swimlanes for different project phases or teams
• Set task priorities, due dates, and time estimates
• Track progress with burndown charts and sprint velocity metrics
• Add custom labels and tags for better task organization
• Filter and search tasks by assignee, status, or priority
• Set work-in-progress (WIP) limits for each column
• View task history and activity logs
• Export sprint data for reporting and analysis
• Integration with time tracking and milestone features`
  },
  {
    title: "ANALYTICS",
    description: "Gain insights into project progress, task distribution, and team performance with comprehensive analytics.",
    image: analytics,
    details: `• Visualize task status distribution (completed, in progress, not started) with interactive pie charts
• Track project progress over time with customizable line charts
• Compare team member workload and task assignment with bar charts
• Monitor sprint velocity and burndown rates
• Analyze task completion trends and identify bottlenecks
• Generate reports on team performance and productivity
• Filter analytics by project, team, or time period
• Export analytics data for further analysis
• Set up custom dashboards for different stakeholders
• Receive automated insights and recommendations based on project data`
  },
  {
    title: "TEAM MANAGEMENT",
    description: "Create teams, invite members via email, and manage permissions all in one place.",
    image: TeamManage,
    details: `• Create multiple teams with custom roles and permissions
• Bulk invite team members via email or shareable links
• Set role-based access controls for different project areas
• Track team member activity and contributions
• Manage team capacity and availability
• Create team templates for quick setup
• Define approval workflows and hierarchies
• Set up team-specific notifications and alerts
• Generate team performance reports
• Integration with external user management systems`
  }
 
];

export function Features() {
  return (
    <section id="features" className="py-12 md:py-16 bg-background [&_details[open]]:bg-muted [&_details[open]]:p-4 [&_details[open]]:rounded-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Features for Modern Teams
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage projects, collaborate with your team, and deliver results.
          </p>
        </motion.div>

        <div className="space-y-24 md:space-y-32">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 0.5,
                ease: [0.21, 0.47, 0.32, 0.98]
              }}
              className={`flex flex-col ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              } items-center gap-8 md:gap-12`}
            >
              <div className="w-full md:w-3/5">
                <motion.div 
                  className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-card shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 768px) 100vw, 60vw"
                    priority={index < 2}
                  />
                </motion.div>
              </div>
              
              <div className="w-full md:w-2/5 text-center md:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="space-y-3"
                >
                  <h3 className="text-xl font-semibold tracking-wide">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-base leading-relaxed max-w-prose">
                    {feature.description}
                  </p>
                  <details className="mt-4 open:pb-4">
                    <summary className="cursor-pointer text-primary font-medium hover:underline">
                      Learn More
                    </summary>
                    <ul className="mt-4 space-y-2 text-sm text-muted-foreground list-disc list-inside pl-4">
                      {feature.details.split('\n').map((detail, idx) => (
                        <li key={idx} className="leading-relaxed">{detail.trim().replace('• ', '')}</li>
                      ))}
                    </ul>
                  </details>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

