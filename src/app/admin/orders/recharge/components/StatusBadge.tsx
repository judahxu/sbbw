import { Badge } from "@/components/ui/badge";

export const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    pending_payment: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    retry_needed: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800"
  };

  const labels = {
    pending_payment: "待付款",
    processing: "充值中",
    retry_needed: "需要重试",
    completed: "已完成", 
    failed: "充值失败"
  };

  return (
    <Badge className={styles[status]}>{labels[status]}</Badge>
  );
};