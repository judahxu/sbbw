
// app/admin/dashboard/components/recent-sales.tsx
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function RecentSales() {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarFallback>U1</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">张三</p>
          <p className="text-sm text-muted-foreground">
            zhang@example.com
          </p>
        </div>
        <div className="ml-auto font-medium">+¥1,999.00</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarFallback>U2</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">李四</p>
          <p className="text-sm text-muted-foreground">
            li@example.com
          </p>
        </div>
        <div className="ml-auto font-medium">+¥39.00</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarFallback>U3</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">王五</p>
          <p className="text-sm text-muted-foreground">
            wang@example.com
          </p>
        </div>
        <div className="ml-auto font-medium">+¥299.00</div>
      </div>
    </div>
  )
}