"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import HomeLink from '../../components/HomeLink';
import 'flowbite';
import { api } from "~/trpc/react";
import { useRouter } from 'next/navigation';
import { useToast } from '~/hooks/use-toast';

export default function Register() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { toast } = useToast()

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [againPassword, setAgainPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
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

  const register = api.auth.register.useMutation({
    onSuccess: () => {
      toast({
        title: "注册成功",
      })
      router.push("/login");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "注册失败",
        description: error.message,
      })
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
      const response = await fetch('/api/sendcode', {  // 修改这里的路径
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          type: 'register'
        }),
      });
  
      const data = await response.json();
  
      if (data.success) {
        toast({
          title: "发送成功",
          description: "验证码已发送到您的邮箱",
        });
        setCountdown(60); // 开始60秒倒计时
      } else {
        toast({
          variant: "destructive",
          title: "发送失败",
          description: data.error || "发送验证码失败",
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

  // 处理注册表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== againPassword) {
      toast({
        variant: "destructive",
        title: "注册失败",
        description: "两次输入的密码不一致",
      })
      return;
    } else if (password.length < 8) {
      toast({
        variant: "destructive",
        title: "注册失败",
        description: "密码长度至少为8个字符",
      })
      return;
    } else if (!email) {
      toast({
        variant: "destructive",
        title: "注册失败",
        description: "邮箱不能为空",
      })
      return;
    } else if (password.length > 20) {
      toast({
        variant: "destructive",
        title: "注册失败",
        description: "密码长度最长为20个字符",
      })
      return;
    } else if (!/^[A-Za-z0-9]+@([a-zA-Z0-9]+[\.])+[a-zA-Z]{2,}$/.test(email)) {
      toast({
        variant: "destructive",
        title: "注册失败",
        description: "邮箱格式不正确",
      })
      return;
    } else if (!verificationCode) {
      toast({
        variant: "destructive",
        title: "注册失败",
        description: "请输入验证码",
      })
      return;
    }

    await register.mutateAsync({
      email,
      password,
      code: verificationCode,
    });
  };

  return (
    <main className="flex flex-col items-center justify-start w-full">
      {isClient && (
        <div className="w-full max-w-md">
          <form className="bg-dark-gray shadow-lg rounded px-8 pt-6 pb-8 mb-4 mt-16">
            <h2 className="text-center text-2xl font-extrabold text-gray-900 mb-4">注册账号</h2>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                邮箱
              </label>
              <input 
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                id="email" 
                type="email" 
                placeholder="Email" 
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
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                密码
              </label>
              <input 
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                id="password" 
                type="password" 
                placeholder="Password" 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirm-password">
                确认密码
              </label>
              <input 
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                id="confirm-password" 
                type="password" 
                placeholder="Confirm Password" 
                onChange={(e) => setAgainPassword(e.target.value)} 
              />
            </div>

            <div className="mb-4">
              <button 
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 w-full rounded focus:outline-none focus:shadow-outline" 
                type="submit"
                onClick={handleSubmit}
              >
                注册
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm">
                已经有账号?
                <a href="/login" className="font-medium text-gray-600 hover:text-gray-500 hover:underline">登录</a>
              </p>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}