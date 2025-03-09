import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function ConversationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarTrigger />
      <div className='bg-slate-200 absolute left-0 right-0 top-5 bottom-0 m-4 rounded-lg p-4 flex flex-col justify-between'>
        {children}
      </div>
    </SidebarProvider>
  );
}
