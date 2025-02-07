// src/components/account-import.tsx
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AccountStatus, ImportedAccount,AccountImportProps } from '../types';
import * as XLSX from 'xlsx';


interface RawExcelRow {
  email: string;
  password: string;
  status?: string;
  notes?: string;
}


export function AccountImport({ onImport, onClose }: AccountImportProps) {
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<ImportedAccount[]>([]);
  const [error, setError] = useState<string>('');

  const downloadTemplate = () => {
    const template = XLSX.utils.book_new();
    const data = [
      ['email', 'password', 'status', 'notes'],
      ['example@gmail.com', 'password123', 'available', '示例备注']
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(template, worksheet, 'Template');
    XLSX.writeFile(template, 'account-import-template.xlsx');
  };


  const validateStatus = (status: string): AccountStatus => {
    const normalizedStatus = status.toLowerCase();
    return normalizedStatus === 'available' || 
           normalizedStatus === 'sold' || 
           normalizedStatus === 'abnormal' 
           ? normalizedStatus as AccountStatus 
           : 'available' as AccountStatus ;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError('');

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const firstSheetName = workbook.SheetNames?.[0] ?? '';
      const worksheet = workbook.Sheets[firstSheetName];
      if (!worksheet) {
        throw new Error('无法读取工作表');
      }
      const rawData = XLSX.utils.sheet_to_json<RawExcelRow>(worksheet);

      const validatedData: ImportedAccount[] = rawData.map((row, index) => {
        // Validate required fields
        if (!row.email || !row.password) {
          throw new Error(`第 ${index + 2} 行：邮箱和密码为必填项`);
        }

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
          throw new Error(`第 ${index + 2} 行：邮箱格式不正确`);
        }

        return {
          email: row.email,
          password: row.password,
          status: validateStatus(row.status ?? 'available'),
          notes: row.notes ?? ''
        };
      });

      setPreview(validatedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入失败');
    } finally {
      setImporting(false);
    }
  };

  const handleImport = () => {
    if (preview.length === 0) {
      setError('没有可导入的数据');
      return;
    }

    onImport(preview);
    onClose();
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>导入账号</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* 模板下载 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">首次使用？下载导入模板：</span>
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            下载模板
          </Button>
        </div>

        {/* 文件上传 */}
        <div className="space-y-2">
          <label className="block">
            <span className="text-sm font-medium">选择Excel文件：</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="mt-1 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </label>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        {/* 数据预览 */}
        {preview.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">数据预览</h3>
            <div className="max-h-60 overflow-auto border rounded">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">邮箱</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">密码</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">备注</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preview.map((account, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm">{account.email}</td>
                      <td className="px-4 py-2 text-sm">{account.password}</td>
                      <td className="px-4 py-2 text-sm">{account.status}</td>
                      <td className="px-4 py-2 text-sm">{account.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500">
              共 {preview.length} 条数据
            </p>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button
            onClick={handleImport}
            disabled={importing || preview.length === 0}
          >
            {importing ? '导入中...' : '确认导入'}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}