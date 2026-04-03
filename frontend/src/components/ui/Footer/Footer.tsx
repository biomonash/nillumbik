import React, { type JSX } from 'react'

const Footer: React.FC = (): JSX.Element => {
  return (
    <footer className="bg-[var(--background)] border-t border-white/10 ml-[var(--sidebar-width)]">
      <div className="max-w-screen-xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Copyright */}
        <p className="text-sm text-muted-foreground">
          © BiOM 2025. All rights reserved.
        </p>

        {/* Social icons */}
        <div className="flex items-center gap-1">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="w-9 h-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-white hover:bg-white/10 transition-all duration-200"
            aria-label="GitHub"
          >
            <i className="fa-brands fa-github text-base" />
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noreferrer"
            className="w-9 h-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-white hover:bg-white/10 transition-all duration-200"
            aria-label="YouTube"
          >
            <i className="fa-brands fa-youtube text-base" />
          </a>
          <a
            href="https://www.linkedin.com/company/biological-observation-monash/posts/?feedView=all"
            target="_blank"
            rel="noreferrer"
            className="w-9 h-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-white hover:bg-white/10 transition-all duration-200"
            aria-label="LinkedIn"
          >
            <i className="fa-brands fa-linkedin text-base" />
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
