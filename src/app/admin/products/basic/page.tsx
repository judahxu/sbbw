'use client'
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Eye } from 'lucide-react';
import ProductConfigDialog from './ProductConfigDialog';
import { api } from "~/trpc/react"; // 导入API客户端
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  type: 'account' | 'accelerator' | 'recharge';
  basePrice: number;
  status: 'active' | 'inactive';
  description: string;
  optionGroups: {
    id: string;
    name: string;
    options: any[];
    dependencies:[]
  }[];
}

const ProductManagement = () => {
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const queryClient = useQueryClient();

  // API查询
  const { data: products, isLoading } = api.product.list.useQuery({
    pageSize: 100 // 暂时加载全部
  });

  // 创建产品mutation
  const createMutation = api.product.create.useMutation({
    onSuccess: () => {
      toast.success("产品创建成功");
      setConfigDialogOpen(false);
      void queryClient.invalidateQueries({ queryKey: [['product', 'list']] });
    },
    onError: (error) => {
      toast.error(error.message || "创建失败");
    }
  });

  // 更新产品mutation  
  const updateMutation = api.product.update.useMutation({
    onSuccess: () => {
      toast.success("更新成功");
      setConfigDialogOpen(false);
      void queryClient.invalidateQueries({ queryKey: [['product', 'list']] });
    },
    onError: (error) => {
      toast.error(error.message || "更新失败");
    }
  });

  // 状态标签样式
  const getStatusBadge = (status: Product['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    const labels = {
      active: '已上架',
      inactive: '已下架'
    };
    
    return <Badge className={styles[status]}>{labels[status]}</Badge>;
  };

  // 产品类型标签
  const getTypeBadge = (type: Product['type']) => {
    const styles = {
      account: 'bg-blue-100 text-blue-800',
      accelerator: 'bg-orange-100 text-orange-800',
      recharge: 'bg-gray-100 text-gray-800'
    };
    const labels = {
      account: '账号产品',
      accelerator: '加速器',
      recharge: '充值服务'
    };
    
    return <Badge className={styles[type]}>{labels[type]}</Badge>;
  };

  // 处理产品保存
  const handleSaveProduct = (product: Product) => {
    if (selectedProduct) {
      // 更新
      updateMutation.mutate({
        id: selectedProduct.id,
        data: {
          name: product.name,
          type: product.type,
          basePrice: Number(product.basePrice),
          status: product.status,
          description: product.description,
          optionGroups: product.optionGroups
        }
      });
    } else {
      // 创建
      createMutation.mutate({
        name: product.name,
        type: product.type,
        basePrice:Number(product.basePrice),
        status: product.status,
        description: product.description,
        optionGroups: product.optionGroups
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">产品管理</h1>
          <p className="text-gray-500">管理产品信息和配置选项</p>
        </div>
        <Button 
          className="bg-black" 
          onClick={() => {
            setSelectedProduct(null);
            setConfigDialogOpen(true);
          }}
          disabled={createMutation.isPending}
        >
          <Plus className="w-4 h-4 mr-2" />
          新增产品
        </Button>
      </div>

      {/* 产品列表 */}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>产品名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>基础价格</TableHead>
                <TableHead>可选项</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : products?.items.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{getTypeBadge(product.type)}</TableCell>
                  <TableCell>¥{product.basePrice}</TableCell>
                  <TableCell>{product.optionGroups?.length || 0}个</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {product.description}
                  </TableCell>
                  <TableCell>{getStatusBadge(product.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setSelectedProduct(product);
                          setConfigDialogOpen(true);
                        }}
                        disabled={updateMutation.isPending}
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        配置
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        预览
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 配置弹窗 */}
      <ProductConfigDialog 
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        product={selectedProduct}
        onSave={handleSaveProduct}
      />
    </div>
  );
};

export default ProductManagement;