'use client'
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Plus, X, ArrowUp, ArrowDown } from 'lucide-react';

// 定义表单验证模式
const bundleFormSchema = z.object({
  name: z.string().min(1, "请输入套餐名称"),
  description: z.string().min(1, "请输入套餐描述"),
  accountType: z.enum(["permanent", "temporary"]),
  platform: z.enum(["chatgpt", "claude"]),
  plusDuration: z.string().nullable(),
  acceleratorDuration: z.string().nullable(),
  features: z.array(z.object({
    label: z.string(),
    included: z.boolean()
  })).min(1, "请至少添加一个特性"),
  originalPrice: z.string().min(0, "原价不能小于0"),
  salePrice: z.string().min(0, "优惠价不能小于0"),
  tag: z.string().nullable(),
  status: z.enum(["active", "inactive"])
});

type BundleFormValues = z.infer<typeof bundleFormSchema>;

interface BundleEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bundle?: Bundle | null;
  onSubmit: (data: BundleFormValues) => Promise<void>;
}

const BundleEditDialog: React.FC<BundleEditDialogProps> = ({
  open,
  onOpenChange,
  bundle,
  onSubmit
}) => {
  // BundleEditDialog.tsx
  const defaultValues: BundleFormValues = {
    name: "",
    description: "",
    accountType: "permanent",
    platform: "chatgpt",
    plusDuration: null,
    acceleratorDuration: null,
    features: [],
    originalPrice: '0',
    salePrice: '0',
    tag: null,
    status: "inactive"
  };
  const form = useForm<BundleFormValues>({
    resolver: zodResolver(bundleFormSchema),
    defaultValues  // 使用提取出的默认值
  });

useEffect(() => {
  if (open) {
    if (bundle) {
      // 编辑模式：使用 bundle 数据
      form.reset(bundle);
    } else {
      // 新建模式：使用默认值
      form.reset(defaultValues);
    }
  } else {
    // 弹窗关闭时：重置表单
    form.reset(defaultValues);
  }
}, [open, bundle, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col gap-0">
        <DialogHeader>
          <DialogTitle>
            {bundle ? "编辑套餐" : "新增套餐"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full overflow-y-auto">
            {/* 基本信息 */}
            <div className="flex-1 overflow-y-auto pr-2 h-full">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>套餐名称</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="输入套餐名称" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>平台类型</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="选择平台" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="chatgpt">ChatGPT</SelectItem>
                            <SelectItem value="claude">Claude</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>套餐描述</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="输入套餐描述" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>账号类型</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="选择账号类型" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="permanent">永久账号</SelectItem>
                            <SelectItem value="temporary">临时账号</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="plusDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plus时长</FormLabel>
                        <Select
                          value={field.value ?? ""}
                          onValueChange={val => field.onChange(val)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="选择Plus时长" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">不包含Plus</SelectItem>
                            <SelectItem value="1m">1个月</SelectItem>
                            <SelectItem value="3m">3个月</SelectItem>
                            <SelectItem value="6m">6个月</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="acceleratorDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>加速器时长</FormLabel>
                        <Select
                          value={field.value ?? ""}
                          onValueChange={val => field.onChange(val)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="选择加速器时长" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">不包含加速器</SelectItem>
                            <SelectItem value="7d">7天</SelectItem>
                            <SelectItem value="15d">15天</SelectItem>
                            <SelectItem value="30d">30天</SelectItem>
                            <SelectItem value="90d">90天</SelectItem>
                            <SelectItem value="180d">180天</SelectItem>
                            <SelectItem value="365d">365天</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 价格设置 */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="originalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>原价</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={e => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="salePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>优惠价</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={e => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 特性列表 */}
                <FormField
                  control={form.control}
                  name="features"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>套餐特性</FormLabel>
                      <div className="space-y-2">
                        {field.value.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={feature.label}
                              onChange={(e) => {
                                const newFeatures = [...field.value];
                                newFeatures[index].label = e.target.value;
                                field.onChange(newFeatures);
                              }}
                              placeholder="特性描述"
                            />
                            <Switch
                              checked={feature.included}
                              onCheckedChange={(checked) => {
                                const newFeatures = [...field.value];
                                newFeatures[index].included = checked;
                                field.onChange(newFeatures);
                              }}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const newFeatures = field.value.filter((_, i) => i !== index);
                                field.onChange(newFeatures);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <div className="flex flex-col gap-1">
                              {index > 0 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const newFeatures = [...field.value];
                                    [newFeatures[index], newFeatures[index - 1]] = 
                                      [newFeatures[index - 1], newFeatures[index]];
                                    field.onChange(newFeatures);
                                  }}
                                >
                                  <ArrowUp className="h-4 w-4" />
                                </Button>
                              )}
                              {index < field.value.length - 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const newFeatures = [...field.value];
                                    [newFeatures[index], newFeatures[index + 1]] = 
                                      [newFeatures[index + 1], newFeatures[index]];
                                    field.onChange(newFeatures);
                                  }}
                                >
                                  <ArrowDown className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            field.onChange([...field.value, { label: "", included: true }]);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          添加特性
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 营销设置 */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tag"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>特色标签</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="输入标签文本" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>状态</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="选择状态" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">上架</SelectItem>
                            <SelectItem value="inactive">下架</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            {/* 提交按钮 */}
            <div className="flex justify-end space-x-2 gap-2 pt-4 border-t mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                取消
              </Button>
              <Button type="submit">
                {bundle ? "保存" : "创建"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BundleEditDialog;