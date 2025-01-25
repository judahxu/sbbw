"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import HomeLink from '../../components/HomeLink';
import 'flowbite';
import { api } from "~/trpc/react";
import { useRouter } from 'next/navigation';
import { useToast } from '~/hooks/use-toast';

export default function Page() {
  const [isClient, setIsClient] = useState(false);

  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    // Once the component mounts, setIsClient will be set to true
    setIsClient(true);
  }, []);

  // 重置密码页面中
const resetPassword = api.auth.resetPassword.useMutation({
  onSuccess: () => {
    toast({
      title:"密码重置成功",
    })
    router.push("/login");
  },
  onError: (error) => {
    toast({
      title: "密码重置失败",
      description: error.message,
    })
  },
});

// 处理重置密码表单提交
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  await resetPassword.mutateAsync({
    email,
    newPassword,
  });
};

  // Conditional rendering based on isClient state
  return (
    <main className="flex flex-col items-center justify-start w-full">

      {isClient && (    
        <div className="w-full max-w-md">
          <form className="bg-dark-gray shadow-lg rounded px-8 pt-6 pb-8 mb-4 mt-16">
            <h2 className="text-center text-2xl font-extrabold text-gray-900 mb-4">忘记密码</h2>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                邮箱
              </label>
              <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="email" type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} /> 
            </div>

            <div className="mb-4">
              <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 w-full rounded focus:outline-none focus:shadow-outline" type="submit">
                发送重置链接
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-sm">
                记起密码了?
                <a href="/login" className="font-medium text-gray-600 hover:text-gray-500 hover:underline">登录</a>
              </p>
            </div>
          </form>
        </div>
    )}
    </main>
  );
}
