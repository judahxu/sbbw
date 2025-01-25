// app/components/HomeLink.tsx

import React from 'react'
import Link from 'next/link'


interface HomeLinkProps {
  to: string;
  first: string;
  second: string;
}

const HomeLink: React.FC<HomeLinkProps> = ({ to, first, second }) => {
  return (
    <Link 
          className="group fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30"
          href={ to }
          rel="noopener noreferrer"
        >
          { first }&nbsp; 
          <code className="font-mono font-bold transition-transform group-hover:translate-x-2 motion-reduce:transform-none">{ second }</code>
    </Link>
  );
};


export default HomeLink;