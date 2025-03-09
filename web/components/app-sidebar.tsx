"use client"

import { Calendar, Home, Inbox, PlusIcon, Search, Settings } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter
} from "@/components/ui/sidebar"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"

// Menu items.
const items = [
    {
        title: "Home",
        url: "#",
        icon: Home,
    },
    {
        title: "Inbox",
        url: "#",
        icon: Inbox,
    },
    {
        title: "Calendar",
        url: "#",
        icon: Calendar,
    },
    {
        title: "Search",
        url: "#",
        icon: Search,
    },
    {
        title: "Settings",
        url: "#",
        icon: Settings,
    },
]

export function AppSidebar() {

    const router = useRouter()

    const handlePlusButtonClick = () => {
        router.push("/conversation/new")
    }

    return (
        <Sidebar>
            <SidebarContent>
                <Button onClick={handlePlusButtonClick} className="flex flex-row items-center justify-center w-1/2 m-2 shadow-lg rounded-lg">
                    <span>
                        <PlusIcon />
                    </span>
                    <span>
                        conversation
                    </span>
                </Button>
                <SidebarGroup>
                    <SidebarGroupLabel>Message history</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            {/* <SidebarFooter className="flex flex-row items-center border m-2 shadow-lg rounded-lg" >
                <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            </SidebarFooter> */}
        </Sidebar>
    )
}
