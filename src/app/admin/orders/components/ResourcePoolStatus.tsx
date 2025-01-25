// src/components/orders/ResourcePoolStatus.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { ResourcePool } from '@/types/orders';

interface ResourcePoolStatusProps {
  pools: ResourcePool[];
  onAddResource: (type: 'accelerator' | 'appleId') => void;
  onViewResources: (type: 'accelerator' | 'appleId') => void;
}

export function ResourcePoolStatus({ 
  pools,
  onAddResource,
  onViewResources
}: ResourcePoolStatusProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {pools.map(pool => (
        <Card key={pool.type}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {pool.type === 'accelerator' ? '加速器配置池状态' : '美区账号池状态'}
              {pool.warning && (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className={`text-2xl font-bold ${
                  pool.warning ? 'text-yellow-600' : ''
                }`}>
                  {pool.available}/{pool.total}
                </div>
                <p className="text-xs text-muted-foreground">可用/总数</p>
              </div>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onViewResources(pool.type)}
                >
                  查看{pool.type === 'accelerator' ? '配置' : '账号'}
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => onAddResource(pool.type)}
                >
                  添加{pool.type === 'accelerator' ? '配置' : '账号'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}