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
      className="flex items-center text-sm font-mono"
      href={to}
      rel="noopener noreferrer"
    >
      <span className="hidden sm:inline">{first}</span>
      <code className="font-bold ml-1">
        {second}
      </code>
    </Link>
  );
};

export default HomeLink;