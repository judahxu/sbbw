'use client'
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ArrowDown, ArrowUp, Trash } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Dependency {
  groupId: string;        // 依赖的选项组ID
  optionValue: string;    // 依赖的选项值
}

interface Option {
  id: string;
  label: string;
  value: string;
  price: number;
}

interface OptionGroup {
  id: string;
  name: string;
  required: boolean;
  options: Option[];
  dependencies: Dependency[];  // 添加依赖配置
}

interface OptionConfigProps {
  optionGroups?: OptionGroup[];
  onChange: (groups: OptionGroup[]) => void;
}

const OptionConfig: React.FC<OptionConfigProps> = ({ 
  optionGroups = [], // 提供默认值
  onChange 
}) => {
  // 添加新选项组
  const handleAddGroup = () => {
    const newGroup: OptionGroup = {
      id: String(Date.now()),
      name: '新选项组',
      required: false,
      options: [],
      dependencies: []
    };
    onChange([...optionGroups, newGroup]);
  };

  // 添加依赖
  const handleAddDependency = (groupId: string) => {
    const group = optionGroups.find(g => g.id === groupId);
    if (!group) return;

    const newDependencies = [...(group.dependencies || []), {
      groupId: '',
      optionValue: ''
    }];

    onChange(optionGroups.map(g => 
      g.id === groupId 
        ? { ...g, dependencies: newDependencies }
        : g
    ));
  };
   // 修改依赖关系
 // 更新依赖
  const handleDependencyChange = (groupId: string, index: number, field: keyof Dependency, value: string) => {
    onChange(optionGroups.map(group => {
      if (group.id !== groupId) return group;
      
      const newDependencies = [...(group.dependencies || [])];
      newDependencies[index] = {
        ...newDependencies[index],
        [field]: value
      };
      
      return {
        ...group,
        dependencies: newDependencies
      };
    }));
  };

   // 删除依赖
   const handleRemoveDependency = (groupId: string, index: number) => {
    onChange(optionGroups.map(group => {
      if (group.id !== groupId) return group;
      
      const newDependencies = [...(group.dependencies || [])];
      newDependencies.splice(index, 1);
      
      return {
        ...group,
        dependencies: newDependencies.length ? newDependencies : undefined
      };
    }));
  };
  
  // 添加新选项
  const handleAddOption = (groupId: string) => {
    const newOption: Option = {
      id: String(Date.now()),
      label: '新选项',
      value: '',
      price: 0
    };
    
    onChange(optionGroups.map(group => 
      group.id === groupId 
        ? { ...group, options: [...group.options, newOption] }
        : group
    ));
  };
  

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>选项组配置</CardTitle>
        <Button onClick={handleAddGroup}>
          <Plus className="w-4 h-4 mr-2" />
          添加选项组
        </Button>
      </CardHeader>
      <CardContent>
        {optionGroups.map((group, groupIndex) => (
          <div key={group.id} className="mb-6 p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Input 
                  value={group.name} 
                  className="w-48"
                  onChange={(e) => {
                    onChange(optionGroups.map(g =>
                      g.id === group.id ? { ...g, name: e.target.value } : g
                    ));
                  }}
                />
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={group.required} 
                    onChange={(e) => {
                      onChange(optionGroups.map(g =>
                        g.id === group.id ? { ...g, required: e.target.checked } : g
                      ));
                    }}
                  />
                  <span>必选</span>
                </label>
              </div>
               {/* 添加依赖配置 */}
               {groupIndex > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">依赖条件</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddDependency(group.id)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      添加依赖
                    </Button>
                  </div>
                  
                  {group.dependencies?.map((dependency, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Select
                        value={dependency.groupId}
                        onValueChange={(value) => handleDependencyChange(group.id, index, 'groupId', value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="选择依赖项" />
                        </SelectTrigger>
                        <SelectContent>
                          {optionGroups.slice(0, groupIndex).map(g => (
                            <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={dependency.optionValue}
                        onValueChange={(value) => handleDependencyChange(group.id, index, 'optionValue', value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="选择选项值" />
                        </SelectTrigger>
                        <SelectContent>
                          {optionGroups
                            .find(g => g.id === dependency.groupId)
                            ?.options.map(option => (
                              <SelectItem key={option.id} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveDependency(group.id, index)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center space-x-2">
                {/* <Button 
                  variant="outline" 
                  size="icon"
                  disabled={index === 0}
                  onClick={() => {
                    if (index > 0) {
                      const newGroups = [...optionGroups];
                      [newGroups[index - 1], newGroups[index]] = 
                        [newGroups[index], newGroups[index - 1]];
                      onChange(newGroups);
                    }
                  }}
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  disabled={index === optionGroups.length - 1}
                  onClick={() => {
                    if (index < optionGroups.length - 1) {
                      const newGroups = [...optionGroups];
                      [newGroups[index], newGroups[index + 1]] = 
                        [newGroups[index + 1], newGroups[index]];
                      onChange(newGroups);
                    }
                  }}
                >
                  <ArrowDown className="w-4 h-4" />
                </Button> */}
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    onChange(optionGroups.filter(g => g.id !== group.id));
                  }}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              {group.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-4">
                  <Input 
                    value={option.label} 
                    className="w-48"
                    placeholder="选项名称"
                    onChange={(e) => {
                      onChange(optionGroups.map(g =>
                        g.id === group.id
                          ? {
                              ...g,
                              options: g.options.map(o =>
                                o.id === option.id
                                  ? { ...o, label: e.target.value }
                                  : o
                              )
                            }
                          : g
                      ));
                    }}
                  />
                  <Input 
                    value={option.value} 
                    className="w-32"
                    placeholder="选项值"
                    onChange={(e) => {
                      onChange(optionGroups.map(g =>
                        g.id === group.id
                          ? {
                              ...g,
                              options: g.options.map(o =>
                                o.id === option.id
                                  ? { ...o, value: e.target.value }
                                  : o
                              )
                            }
                          : g
                      ));
                    }}
                  />
                  <Input 
                    type="number" 
                    value={option.price} 
                    className="w-32"
                    placeholder="价格调整"
                    onChange={(e) => {
                      onChange(optionGroups.map(g =>
                        g.id === group.id
                          ? {
                              ...g,
                              options: g.options.map(o =>
                                o.id === option.id
                                  ? { ...o, price: Number(e.target.value) }
                                  : o
                              )
                            }
                          : g
                      ));
                    }}
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => {
                      onChange(optionGroups.map(g =>
                        g.id === group.id
                          ? {
                              ...g,
                              options: g.options.filter(o => o.id !== option.id)
                            }
                          : g
                      ));
                    }}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => handleAddOption(group.id)}
              >
                <Plus className="w-4 h-4 mr-2" />
                添加选项
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default OptionConfig;