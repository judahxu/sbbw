// app/components/LoginLink.tsx

import React from 'react'
import Link from 'next/link'
import Image from 'next/image';


interface LoginLinkProps {
  to: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  title: string;
}

const LoginLink: React.FC<LoginLinkProps> = ({ to, src, alt, width, height, title }) => {
  return (
    <div className="group fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
        <Link
          className="flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0 transition-transform group-hover:translate-y-2 motion-reduce:transform-none"
          href="/login"
          rel="noopener noreferrer"
        >
          <Image
            src={ src }
            alt={ alt }
            className="dark:invert"
            width={ width }
            height={ height }
            priority
          />
          { title }
        </Link>
    </div>
  );
};


export default LoginLink;