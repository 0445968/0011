'use client';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Check,
  ChevronDown,
  Copy,
  Facebook,
  Linkedin,
  Mail,
  Share2,
} from 'lucide-react';

interface ArticleShareButtonProps {
  title: string;
  excerpt: string;
}

export function ArticleShareButton({
  title,
  excerpt,
}: ArticleShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener(
      'mousedown',
      handlePointerDown
    );

    document.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handlePointerDown
      );

      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, []);

  function getCurrentUrl() {
    if (typeof window === 'undefined') {
      return '';
    }

    return window.location.href;
  }

  async function copyLink() {
    const url = getCurrentUrl();

    if (!url) {
      return;
    }

    try {
      await navigator.clipboard.writeText(url);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      /**
       * Clipboard access may be unavailable in some
       * browser contexts. The other share options
       * remain available.
       */
    }
  }

  function openShareWindow(url: string) {
    window.open(
      url,
      '_blank',
      'noopener,noreferrer,width=720,height=620'
    );
  }

  function shareLinkedIn() {
    const url = encodeURIComponent(getCurrentUrl());

    openShareWindow(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
    );
  }

  function shareFacebook() {
    const url = encodeURIComponent(getCurrentUrl());

    openShareWindow(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`
    );
  }

  function shareX() {
    const url = encodeURIComponent(getCurrentUrl());
    const text = encodeURIComponent(title);

    openShareWindow(
      `https://twitter.com/intent/tweet?url=${url}&text=${text}`
    );
  }

  function shareEmail() {
    const url = getCurrentUrl();

    const subject = encodeURIComponent(title);

    const body = encodeURIComponent(
      `${excerpt}\n\n${url}`
    );

    window.location.href =
      `mailto:?subject=${subject}&body=${body}`;
  }

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="
          group
          flex
          w-full
          items-center
          justify-between
          gap-4
          rounded-xl
          px-3
          py-3
          text-left
          transition-colors
          duration-300
          hover:bg-secondary
        "
      >
        <span
          className="
            flex
            min-w-0
            items-center
            gap-3
          "
        >
          <span
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-border
              transition-colors
              duration-300
              group-hover:border-foreground
            "
          >
            <Share2
              size={15}
              strokeWidth={1.7}
            />
          </span>

          <span>
            <span
              className="
                block
                text-sm
                font-medium
                text-foreground
              "
            >
              Share article
            </span>

            <span
              className="
                mt-0.5
                block
                text-xs
                text-muted-foreground
              "
            >
              Send or save this story
            </span>
          </span>
        </span>

        <ChevronDown
          size={15}
          strokeWidth={1.6}
          className={`
            shrink-0
            text-muted-foreground
            transition-transform
            duration-300
            ${open ? 'rotate-180' : ''}
          `}
        />
      </button>

      {open && (
        <div
          className="
            absolute
            left-0
            right-0
            top-[calc(100%+8px)]
            z-40
            overflow-hidden
            rounded-2xl
            border
            border-border
            bg-background
            p-2
            shadow-xl
            shadow-black/5
          "
        >
          <ShareOption
            icon={
              copied ? (
                <Check
                  size={15}
                  strokeWidth={1.7}
                />
              ) : (
                <Copy
                  size={15}
                  strokeWidth={1.7}
                />
              )
            }
            label={
              copied
                ? 'Link copied'
                : 'Copy link'
            }
            onClick={copyLink}
          />

          <ShareOption
            icon={
              <Linkedin
                size={15}
                strokeWidth={1.7}
              />
            }
            label="LinkedIn"
            onClick={shareLinkedIn}
          />

          <ShareOption
            icon={
              <span
                className="
                  flex
                  h-[15px]
                  w-[15px]
                  items-center
                  justify-center
                  text-[11px]
                  font-semibold
                  leading-none
                "
              >
                X
              </span>
            }
            label="X"
            onClick={shareX}
          />

          <ShareOption
            icon={
              <Facebook
                size={15}
                strokeWidth={1.7}
              />
            }
            label="Facebook"
            onClick={shareFacebook}
          />

          <ShareOption
            icon={
              <Mail
                size={15}
                strokeWidth={1.7}
              />
            }
            label="Email"
            onClick={shareEmail}
          />
        </div>
      )}
    </div>
  );
}

function ShareOption({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex
        w-full
        items-center
        gap-3
        rounded-xl
        px-3
        py-2.5
        text-sm
        text-muted-foreground
        transition-colors
        duration-200
        hover:bg-secondary
        hover:text-foreground
      "
    >
      <span
        className="
          flex
          h-7
          w-7
          items-center
          justify-center
        "
      >
        {icon}
      </span>

      {label}
    </button>
  );
}