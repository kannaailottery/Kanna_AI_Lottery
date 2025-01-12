import Link from 'next/link';

export default function SocialLinks() {
  return (
    <div className="fixed top-8 right-8 flex items-center space-x-4">
      <Link
        href="https://x.com/kanna_ai_sol"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-black/40 p-3 rounded-full text-white hover:text-kanna-400 hover:bg-black/60 transition-all"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-7 h-7"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </Link>
    </div>
  );
} 