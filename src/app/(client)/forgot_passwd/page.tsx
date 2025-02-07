"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '~/hooks/use-toast';
import { api } from "~/trpc/react";

interface SendCodeResponse {
  success: boolean;
  error?: string;
}

export default function ForgotPasswordPage() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 重置密码mutation
  const resetPassword = api.auth.resetPassword.useMutation({
    onSuccess: () => {
      toast({
        title: "重置成功",
        description: "密码已重置，请使用新密码登录"
      });
      router.push('/login');
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "重置失败",
        description: error.message
      });
    },
  });

  // 发送验证码
  const handleSendCode = async () => {
    if (countdown > 0) return;
    
    if (!email) {
      toast({
        variant: "destructive",
        title: "发送失败",
        description: "请输入邮箱",
      });
      return;
    }

    if (!/^[A-Za-z0-9]+@([a-zA-Z0-9]+[\.])+[a-zA-Z]{2,}$/.test(email)) {
      toast({
        variant: "destructive",
        title: "发送失败",
        description: "邮箱格式不正确",
      });
      return;
    }

    try {
      const response = await fetch('/api/sendcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          type: 'reset'
        }),
      });

      const data = await response.json() as SendCodeResponse;

      if (data.success) {
        toast({
          title: "发送成功",
          description: "验证码已发送到您的邮箱",
        });
        setCountdown(60);
      } else {
        toast({
          variant: "destructive",
          title: "发送失败",
          description: data.error ?? "发送验证码失败",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "发送失败",
        description: "发送验证码时出错",
      });
    }
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证表单
    if (!email) {
      toast({
        variant: "destructive",
        title: "重置失败",
        description: "邮箱不能为空",
      });
      return;
    }

    if (!/^[A-Za-z0-9]+@([a-zA-Z0-9]+[\.])+[a-zA-Z]{2,}$/.test(email)) {
      toast({
        variant: "destructive",
        title: "重置失败",
        description: "邮箱格式不正确",
      });
      return;
    }

    if (!verificationCode) {
      toast({
        variant: "destructive",
        title: "重置失败",
        description: "请输入验证码",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "重置失败",
        description: "密码长度至少为8个字符",
      });
      return;
    }

    if (newPassword.length > 20) {
      toast({
        variant: "destructive",
        title: "重置失败",
        description: "密码长度最长为20个字符",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "重置失败",
        description: "两次输入的密码不一致",
      });
      return;
    }

    await resetPassword.mutateAsync({
      email,
      code: verificationCode,
      newPassword,
    });
  };

  return (
    <main className="flex flex-col items-center justify-start w-full">
      {isClient && (
        <div className="w-full max-w-md">
          <form className="bg-dark-gray shadow-lg rounded px-8 pt-6 pb-8 mb-4 mt-16">
            <h2 className="text-center text-2xl font-extrabold text-gray-900 mb-4">重置密码</h2>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                邮箱
              </label>
              <input 
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                id="email" 
                type="email" 
                placeholder="请输入邮箱" 
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="verification-code">
                验证码
              </label>
              <div className="flex gap-2">
                <input 
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                  id="verification-code" 
                  type="text" 
                  placeholder="请输入验证码" 
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                <button
                  type="button"
                  className={`${
                    countdown > 0 ? 'bg-gray-400' : 'bg-gray-500 hover:bg-gray-700'
                  } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline whitespace-nowrap`}
                  onClick={handleSendCode}
                  disabled={countdown > 0}
                >
                  {countdown > 0 ? `${countdown}s` : '发送验证码'}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="new-password">
                新密码
              </label>
              <input 
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                id="new-password" 
                type="password" 
                placeholder="请输入新密码" 
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirm-password">
                确认新密码
              </label>
              <input 
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                id="confirm-password" 
                type="password" 
                placeholder="请再次输入新密码" 
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <button 
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 w-full rounded focus:outline-none focus:shadow-outline" 
                type="submit"
                onClick={handleSubmit}
              >
                重置密码
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm">
                想起密码了？
                <a href="/login" className="font-medium text-gray-600 hover:text-gray-500 hover:underline">返回登录</a>
              </p>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}