'use client'
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Search, Filter, Plus, RefreshCcw, MoreHorizontal, Settings, Package,ArrowUp,ArrowDown } from 'lucide-react';
// import ProductEditDialog  from '../../components/admin/ProductEditDialog';
// import ProductConfigDialog  from '../../components/admin/ProductConfigDialog';
import { useToast } from "@/hooks/use-toast"

// 模拟数据
const mockProducts = [
  {
    id: 1,
    name: 'ChatGPT Basic Account',
    category: 'permanent',
    type: 'account',
    basePrice: 99,
    stock: 150,
    status: 'active',
    isConfigurable: true,
    features: ['永久账号所有权', '支持更换密码'],
    bundledProducts: ['7天加速器'],
  },
  {
    id: 2,
    name: 'Plus Account (3个月)',
    category: 'plus',
    type: 'subscription',
    basePrice: 799,
    stock: 50,
    status: 'active',
    isConfigurable: true,
    features: ['账号所有权', 'GPT4使用额度'],
    bundledProducts: [],
  },
];

const mockBundles = [
  {
    id: 1,
    name: '畅享套餐',
    description: '永久账号 + 365天加速器',
    originalPrice: 499,
    salePrice: 399,
    tag: '最热',
    status: 'active',
    products: ['永久账号', '365天加速器'],
    features: ['永久账号所有权', '365天加速器服务', '支持更换密码', '优先技术支持'],
  },
  {
    id: 2,
    name: 'Plus尊享套餐',
    description: 'Plus账号 + 180天加速器',
    originalPrice: 999,
    salePrice: 799,
    status: 'active',
    products: ['Plus账号', '180天加速器'],
    features: ['永久账号所有权', '180天加速器服务', '3个月Plus订阅', 'GPT4使用额度'],
  },
];

const mockOptions = [
  {
    id: 'ownership',
    name: '账号类型',
    required: true,
    values: [
      {
        value: 'permanent',
        label: '永久账号',
        priceAdjustment: 0,
        description: '账号归您所有，可自行管理和更改密码',
      },
      {
        value: 'temporary',
        label: '临时账号',
        priceAdjustment: -79,
        description: '使用期限内可用，到期自动失效',
      },
    ],
  },
  {
    id: 'duration',
    name: '使用时长',
    required: true,
    dependsOn: {
      optionId: 'ownership',
      value: 'temporary',
    },
    values: [
      {
        value: '7d',
        label: '7天体验',
        priceAdjustment: 0,
        description: '含7天加速器',
      },
      {
        value: '15d',
        label: '15天使用',
        priceAdjustment: 20,
        description: '含15天加速器',
      },
    ],
  },
];


const ProductManagement = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { toast } = useToast();

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      active: '已上架',
      inactive: '已下架',
    };
    
    return (
      <Badge className={styles[status]}>{labels[status]}</Badge>
    );
  };

   // 处理编辑
   const handleEdit = (product) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };

  // 处理配置
  const handleConfig = (product) => {
    setSelectedProduct(product);
    setConfigDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">产品管理</h1>
      </div>

  
      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="products">基础产品</TabsTrigger>
          <TabsTrigger value="bundles">推荐套餐</TabsTrigger>
          <TabsTrigger value="options">配置选项</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products">
          <div className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2 flex-1">
                    <Search className="w-4 h-4 text-gray-500" />
                    <Input
                      placeholder="搜索产品..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="产品类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="permanent">永久账号</SelectItem>
                      <SelectItem value="temporary">临时账号</SelectItem>
                      <SelectItem value="plus">Plus账号</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    高级筛选
                  </Button>
                  <Button className="bg-black">
                    <Plus className="w-4 h-4 mr-2" />
                    新增产品
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Products Table */}
            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>产品名称</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>基础价格</TableHead>
                      <TableHead>库存</TableHead>
                      <TableHead>可配置</TableHead>
                      <TableHead>特性</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell>¥{product.basePrice}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>
                          {product.isConfigurable ? (
                            <Badge variant="secondary">支持配置</Badge>
                          ) : (
                            <Badge variant="outline">固定配置</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {product.features.map((feature, index) => (
                              <Badge key={index} variant="outline">{feature}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(product.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm"  onClick={() => handleConfig(product)}>
                              <Settings className="w-4 h-4 mr-1" />
                              配置
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                              编辑
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bundles Tab */}
        <TabsContent value="bundles">
          <div className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2 flex-1">
                    <Search className="w-4 h-4 text-gray-500" />
                    <Input
                      placeholder="搜索套餐..."
                      className="max-w-sm"
                    />
                  </div>
                  <Button className="bg-black">
                    <Plus className="w-4 h-4 mr-2" />
                    新增套餐
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Bundles Table */}
            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>套餐名称</TableHead>
                      <TableHead>描述</TableHead>
                      <TableHead>原价</TableHead>
                      <TableHead>优惠价</TableHead>
                      <TableHead>包含产品</TableHead>
                      <TableHead>特色标签</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockBundles.map((bundle) => (
                      <TableRow key={bundle.id}>
                        <TableCell className="font-medium">{bundle.name}</TableCell>
                        <TableCell>{bundle.description}</TableCell>
                        <TableCell>¥{bundle.originalPrice}</TableCell>
                        <TableCell>¥{bundle.salePrice}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {bundle.products.map((product, index) => (
                              <Badge key={index} variant="secondary">{product}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {bundle.tag && (
                            <Badge className="bg-orange-100 text-orange-800">
                              {bundle.tag}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(bundle.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm">
                              <Package className="w-4 h-4 mr-1" />
                              配置
                            </Button>
                            <Button variant="outline" size="sm">
                              编辑
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Options Tab */}
        <TabsContent value="options">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle>配置选项管理</CardTitle>
                <Button className="bg-black">
                  <Plus className="w-4 h-4 mr-2" />
                  新增选项组
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {mockOptions.map((option) => (
                  <AccordionItem key={option.id} value={option.id}>
                    <AccordionTrigger className="px-4">
                      <div className="flex items-center gap-4">
                        <span>{option.name}</span>
                        {option.required && (
                          <Badge variant="secondary">必选</Badge>
                        )}
                        {option.dependsOn && (
                          <Badge variant="outline">
                            依赖于: {option.dependsOn.optionId} = {option.dependsOn.value}
                            </Badge>
                          )}
                          <Badge variant="outline" className="ml-2">
                            {option.values.length} 个选项
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="p-4 space-y-4">
                          {/* 选项组设置 */}
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <Checkbox 
                                id={`required-${option.id}`}
                                checked={option.required}
                              />
                              <label htmlFor={`required-${option.id}`}>
                                必选项
                              </label>
                            </div>
                            <Select 
                              value={option.dependsOn?.optionId || ""}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="选择依赖项" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">无依赖</SelectItem>
                                {mockOptions
                                  .filter(opt => opt.id !== option.id)
                                  .map(opt => (
                                    <SelectItem key={opt.id} value={opt.id}>
                                      依赖于: {opt.name}
                                    </SelectItem>
                                  ))
                                }
                              </SelectContent>
                            </Select>
                          </div>

                          {/* 选项值表格 */}
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-12">排序</TableHead>
                                <TableHead>选项值</TableHead>
                                <TableHead>显示名称</TableHead>
                                <TableHead>价格调整</TableHead>
                                <TableHead>描述</TableHead>
                                <TableHead className="text-right">操作</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {option.values.map((value, valueIndex) => (
                                <TableRow key={value.value}>
                                  <TableCell>
                                    <div className="flex flex-col gap-1">
                                      {valueIndex > 0 && (
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          className="h-6 w-6 p-0"
                                        >
                                          <ArrowUp className="h-4 w-4" />
                                        </Button>
                                      )}
                                      {valueIndex < option.values.length - 1 && (
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          className="h-6 w-6 p-0"
                                        >
                                          <ArrowDown className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>{value.value}</TableCell>
                                  <TableCell>{value.label}</TableCell>
                                  <TableCell>
                                    <span className={value.priceAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}>
                                      {value.priceAdjustment >= 0 ? '+' : ''}
                                      ¥{value.priceAdjustment}
                                    </span>
                                  </TableCell>
                                  <TableCell className="max-w-xs truncate">
                                    {value.description}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end space-x-2">
                                      <Button variant="outline" size="sm">
                                        编辑
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        删除
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>

                          {/* 添加选项值按钮 */}
                          <div className="flex justify-end mt-4">
                            <Button variant="outline">
                              <Plus className="w-4 h-4 mr-2" />
                              添加选项值
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
      </Tabs>

      {/* <ProductEditDialog 
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        product={selectedProduct}
      />
      
      <ProductConfigDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        product={selectedProduct}
      /> */}
      
    </div>
  );
};

export default ProductManagement;

       
                              