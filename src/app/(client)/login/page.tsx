"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import HomeLink from '../../components/HomeLink';
import 'flowbite';
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "~/hooks/use-toast";

export default function Page() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Once the component mounts, setIsClient will be set to true
    setIsClient(true);
  }, []);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    if (!formData.email || !formData.password) {
      toast({
        variant: "destructive",
        title: "登录失败",
        description: "请填写完整的登录信息",
      })
      return;
    }else if (formData.password.length < 8) {
      toast({
        variant: "destructive",
        title: "登录失败",
        description: "密码长度至少为8个字符",
      })
      return;
    }else if (formData.password.length > 20) {
      toast({
        variant: "destructive",
        title: "登录失败",
        description: "密码长度最长为20个字符",
      })
      return;
    }else if (!/^[A-Za-z0-9]+@([a-zA-Z0-9]+[\.])+[a-zA-Z]{2,}$/.test(formData.email)) {
      toast({
        variant: "destructive",
        title: "登录失败",
        description: "请输入正确的邮箱地址",
      })
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        toast({
          title: "登录失败",
          description: result.error,
        })
      } else {
        toast({
          title: "登录成功",
          description: "欢迎回来！",
        })
        // 登录成功后跳转到管理面板
        router.push("/");
      } 
    } catch (error) {
      toast({
        variant: "destructive",
        title: "登录失败",
        description: (error as Error).message,
      })
    } finally {
      setLoading(false);
    }
  };


  // Conditional rendering based on isClient state
  return (
    <main className="flex flex-col items-center justify-start w-full">

      {isClient && (
        <div className="w-full max-w-md">
          <form className="bg-dark-gray shadow-lg rounded px-8 pt-6 pb-8 mb-4 mt-16">
            <h2 className="text-center text-2xl font-extrabold text-gray-900 mb-4">欢迎登录</h2>
              <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                      邮箱 
                  </label>
                  <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="email" type="email" placeholder="Email" onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>

              <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                      密码 
                  </label>
                  <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="Password" onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              </div>

              <div className="text-sm mb-4">
                  <a href="/forgot_passwd" className="font-medium text-gray-600 hover:text-gray-500 hover:underline">
                      忘记密码?
                  </a>
              </div>

              <div className="mb-4">
                  <button className={`bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 w-full rounded focus:outline-none focus:shadow-outline loading ? "opacity-50 cursor-not-allowed" : ""`} type="submit" onClick={handleSubmit}>
                    {loading ? "登录中..." : "登录"} 
                  </button>
              </div>

              <div className="text-center">
                  <p className="text-sm">
                      没有账号?
                      <a href="/register" className="font-medium text-gray-600 hover:text-gray-500 hover:underline">  点击注册</a>
                  </p>
              </div>
        </form>
        </div>
      )}
    </main>
  );
}