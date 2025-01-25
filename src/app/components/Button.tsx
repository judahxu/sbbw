// app/components/Button.tsx

import React from 'react'
import Link from 'next/link'


interface ServiceLinkProps {
  // to: string;
  title: string;
}

const Button: React.FC<ServiceLinkProps> = ({ title }) => {
  return (
    <button className="px-4 py-2 mt-6 text-lg  border-2 shadow-md rounded-md bg-gradient-to-r from-transparent to-transparent hover:bg-gray-300 hover:font-semibold focus:outline-none focus:ring-2 focus:ring-black-300 focus:ring-opacity-50 transition-colors" type="submit">
      { title }  
    </button>
    // <Link href={ to }
    //   className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
    // >
    //   <h2 className="mb-3 text-2xl font-semibold">
    //     <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
    //       -&gt;
    //     </span>
    //     {' '}{title}
    //   </h2>
    //   <p className="m-0 max-w-[30ch] text-sm opacity-50">
    //     {description}
    //   </p>
    // </Link>
  );
};


export default Button;