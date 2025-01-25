// ProductConfigDialog.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Eye, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import OptionConfig from './OptionConfig';
import { toast } from "sonner";

interface Product {
  id?: string;
  name: string;
  type: 'account' | 'accelerator' | 'recharge';
  basePrice: number;
  status: 'active' | 'inactive';
  description: string;
  optionGroups?: any[];
}

interface ProductConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSave?: (product: Product) => void;
}

const ProductConfigDialog: React.FC<ProductConfigDialogProps> = ({
  open,
  onOpenChange,
  product,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    basePrice: 0,
    description: '',
    type: 'account',
    status: 'inactive',
    optionGroups: []
  });

  useEffect(() => {
    if (product) {
      setFormData(product);
    }
  }, [product]);

  const handleChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // 表单验证
      if (!formData.name || !formData.type || formData.basePrice < 0) {
        toast.error("请完整填写必要信息");
        return;
      }

      if (onSave) {
        await onSave(formData as Product);
      }
      onOpenChange(false);
    } catch (error) {
      toast.error("保存失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {product ? '编辑产品' : '新增产品'}
          </DialogTitle>
          <div className="flex justify-end space-x-4">
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              预览
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              保存
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="basic">基础信息</TabsTrigger>
              <TabsTrigger value="options">选项配置</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">产品名称</label>
                        <Input 
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          placeholder="输入产品名称"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">基础价格</label>
                        <Input 
                          type="number"
                          value={formData.basePrice}
                          onChange={(e) => handleChange('basePrice', Number(e.target.value))}
                          placeholder="输入基础价格"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">产品类型</label>
                        <Select 
                          value={formData.type} 
                          onValueChange={(value) => handleChange('type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择产品类型" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="account">账号产品</SelectItem>
                            <SelectItem value="accelerator">加速器</SelectItem>
                            <SelectItem value="recharge">充值服务</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">产品状态</label>
                        <Select 
                          value={formData.status} 
                          onValueChange={(value) => handleChange('status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择状态" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">上架</SelectItem>
                            <SelectItem value="inactive">下架</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">产品描述</label>
                      <textarea 
                        className="w-full mt-1 p-2 border rounded-md" 
                        rows={4}
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="输入产品描述"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="options">
              <OptionConfig 
                optionGroups={formData.optionGroups || []}
                onChange={(groups) => handleChange('optionGroups', groups)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductConfigDialog;