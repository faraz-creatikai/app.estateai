'use client'

import { ChevronRight, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ElementType } from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon | ElementType
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const { state } = useSidebar()
  const pathname = usePathname() // <-- current URL

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.url // check if current path matches item

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isActive} // open collapsible if active
              className="group/collapsible"
            >
              <SidebarMenuItem className={`${state === "collapsed" ? "flex flex-col justify-center items-center" : ""}`}>
                <CollapsibleTrigger asChild>
                  <Link href={item.url}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={`cursor-pointer text-[16px] 
                        ${isActive ? "bg-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white text-white" : " hover:bg-gray-200 dark:hover:bg-[var(--color-primary-darker)] dark:hover:text-white"}`}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      {item.items && (
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      )}
                    </SidebarMenuButton>
                  </Link>
                </CollapsibleTrigger>

                {item.items && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => {
                        const isSubActive = pathname === subItem.url
                        return (
                          <SidebarMenuSubItem key={subItem.title} >
                            <SidebarMenuSubButton asChild className={` text-[var(--color-lightdark)] hover:bg-gray-200 dark:hover:bg-[var(--color-primary-darker)]  ${isSubActive ? " bg-[var(--color-primary)] text-white" : ""}`}>
                              <Link href={subItem.url}>
                                <span>
                                  {subItem.title}
                                </span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
