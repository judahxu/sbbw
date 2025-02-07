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
    <Link
      className="flex items-center ml-4"
      href="/login"
      rel="noopener noreferrer"
    >
      <span className="text-sm">{title}</span>
    </Link>
  );
};

export default LoginLink;