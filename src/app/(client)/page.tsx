import Image from 'next/image'
import Link from 'next/link'
import ServiceLink from '../components/ServiceLink'
import HomeLink from '../components/HomeLink'
import LoginLink from '../components/LoginLink'
import {UserNav} from '../components/user-nav'

export default function Home() {
  return (
      <div className="flex flex-col items-center justify-between w-full">
        <div className="relative flex place-items-center before:absolute before:h-[360px] before:w-[360px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
          <Image
            className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert m-20"
            src="/images/see-future.svg"
            alt="See Big Big World"
            width={360}
            height={360}
            priority
          />
        </div>
        
        <div className="grid lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
          <ServiceLink
            to="/product"
            title="ChatGPT账号"
            description="提供 ChatGPT 官方账号，独立账号，永久使用。"
          />
          <ServiceLink
            to="/product"
            title="GPT加速器"
            description="提供可靠、不间断的 GPT 加速服务，让您高速、稳定地访问 ChatGPT。"
          />
          <ServiceLink
            to="/product"
            title="GPT4.0充值"
            description="提供 ChatGPT4.0充值服务，支持支付宝、微信、银行卡等多种支付方式。"
          />
          <ServiceLink
            to="/help"
            title="技术交流"
            description="提供技术交流和帮助文档，有问题可以随时联系我们。"
          />
        </div>
      </div>
  )
}
