'use client'

import { ChevronRight, Home } from 'lucide-react'
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function BreadcrumbNav() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  // Function to get the appropriate label for a segment
  const getLabel = (segment: string) => {
    if (segment === 'team-members') return 'Team Members'
    if (segment.length === 24 && /^[0-9a-f]{24}$/i.test(segment)) return 'Team Details'
    return segment.charAt(0).toUpperCase() + segment.slice(1)
  }

  // Create breadcrumb items based on URL segments
  const breadcrumbItems = segments
    .filter(segment => segment !== 'console' && segment !== 'manage')
    .map((segment, index, filteredSegments) => {
      const href = `/${segments.slice(0, segments.indexOf(segment) + 1).join('/')}`
      const isLast = index === filteredSegments.length - 1
      const label = getLabel(segment)

      return (
        <BreadcrumbItem key={href}>
          {isLast ? (
            <BreadcrumbPage>{label}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
          )}
          {!isLast && (
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
          )}
        </BreadcrumbItem>
      )
    })

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/console">
            <Home className="h-4 w-4" />
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbSeparator>
        {breadcrumbItems}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

