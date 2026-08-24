'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, X, Link2, ThumbsUp, MessageCircle, Repeat2, Send, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LabShell } from '../shared/LabShell';
import type { LabItem } from '@/data/studio-lab/registry';

const STORAGE_KEY = 'studio-lab-social-preview';

interface SocialPost {
  displayName: string;
  username: string;
  text: string;
  imageUrl: string | null;
  linkUrl: string;
  linkTitle: string;
  linkDescription: string;
}

const defaultPost: SocialPost = {
  displayName: 'Bivi Studio',
  username: 'bivi',
  text: 'We just launched a new Studio Lab with interactive tools for designers and agencies. Check it out — invoice generators, color palettes, brand assessments, and more.',
  imageUrl: null,
  linkUrl: 'bivi.studio/studio-lab',
  linkTitle: 'Studio Lab — Interactive Tools for Designers',
  linkDescription: 'Free tools and brand assessments you can use right in your browser.',
};

function loadPost(): SocialPost {
  if (typeof window === 'undefined') return defaultPost;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultPost, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return defaultPost;
}

type Platform = 'instagram' | 'linkedin' | 'x' | 'facebook' | 'og';

const platforms: { id: Platform; label: string }[] = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'x', label: 'X' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'og', label: 'Link / OG' },
];

export function SocialPreview({ item }: { item: LabItem }) {
  const [post, setPost] = useState<SocialPost>(loadPost);
  const [activePlatform, setActivePlatform] = useState<Platform>('instagram');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      // Don't persist image data URL (too large)
      const { imageUrl, ...rest } = post;
      void imageUrl;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    } catch { /* ignore */ }
  }, [post]);

  const update = useCallback(<K extends keyof SocialPost>(key: K, value: SocialPost[K]) => {
    setPost((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    update('imageUrl', url);
  };

  const handleRemoveImage = () => {
    if (post.imageUrl) URL.revokeObjectURL(post.imageUrl);
    update('imageUrl', null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    handleRemoveImage();
    setPost(defaultPost);
  };

  const charCount = post.text.length;

  return (
    <LabShell item={item} onReset={handleReset}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        {/* Editor */}
        <div className="space-y-5 print:hidden">
          {/* Account */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <label className="mb-3 block text-sm font-semibold">Account</label>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Display Name</label>
                <input
                  type="text"
                  value={post.displayName}
                  onChange={(e) => update('displayName', e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Username / Handle</label>
                <input
                  type="text"
                  value={post.username}
                  onChange={(e) => update('username', e.target.value.replace(/^@/, ''))}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Post text */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <label className="mb-3 block text-sm font-semibold">Post Text</label>
            <textarea
              value={post.text}
              onChange={(e) => update('text', e.target.value)}
              rows={5}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Write your post..."
            />
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className={cn(charCount > 280 ? 'text-warning' : 'text-muted-foreground')}>
                {charCount} characters
              </span>
              {charCount > 280 && (
                <span className="text-warning">May exceed some platform limits</span>
              )}
            </div>
          </div>

          {/* Image */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <label className="mb-3 block text-sm font-semibold">Image</label>
            {post.imageUrl ? (
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-lg border border-border">
                  <img src={post.imageUrl} alt="Selected" className="aspect-video w-full object-cover" />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
                    aria-label="Remove image"
                  >
                    <X size={14} />
                  </button>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Replace image
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-border py-8 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <ImageIcon size={24} />
                <span className="mt-2 text-xs">Click to select an image</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Link card */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <label className="mb-3 block text-sm font-semibold">Link Card (Optional)</label>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Link URL / Domain</label>
                <input
                  type="text"
                  value={post.linkUrl}
                  onChange={(e) => update('linkUrl', e.target.value)}
                  placeholder="example.com"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Link Title</label>
                <input
                  type="text"
                  value={post.linkTitle}
                  onChange={(e) => update('linkTitle', e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Link Description</label>
                <input
                  type="text"
                  value={post.linkDescription}
                  onChange={(e) => update('linkDescription', e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Preview may differ from the live platform. Approximate layouts for reference only.
          </p>
        </div>

        {/* Preview workspace */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          {/* Platform selector */}
          <div className="mb-4 flex flex-wrap gap-2">
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePlatform(p.id)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                  activePlatform === p.id
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-card text-muted-foreground hover:text-foreground',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Preview area */}
          <div className="rounded-2xl border border-border bg-muted/20 p-6 md:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePlatform}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                {activePlatform === 'instagram' && <InstagramPreview post={post} />}
                {activePlatform === 'linkedin' && <LinkedInPreview post={post} />}
                {activePlatform === 'x' && <XPreview post={post} />}
                {activePlatform === 'facebook' && <FacebookPreview post={post} />}
                {activePlatform === 'og' && <OGPreview post={post} />}
              </motion.div>
            </AnimatePresence>
          </div>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Preview may differ from the live platform.
          </p>
        </div>
      </div>
    </LabShell>
  );
}

// --- Preview components ---

function Avatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase() || '?';
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
      {initial}
    </span>
  );
}

function InstagramPreview({ post }: { post: SocialPost }) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-border bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-3">
        <Avatar name={post.displayName} />
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold">{post.displayName || 'Your Name'}</p>
          <p className="truncate text-xs text-muted-foreground">@{post.username || 'username'}</p>
        </div>
        <span className="text-muted-foreground">···</span>
      </div>
      {/* Image */}
      {post.imageUrl ? (
        <img src={post.imageUrl} alt="Post" className="aspect-square w-full object-cover" />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center bg-muted text-muted-foreground">
          <ImageIcon size={40} />
        </div>
      )}
      {/* Actions */}
      <div className="flex items-center gap-4 p-3 text-foreground">
        <HeartIcon />
        <MessageCircle size={22} />
        <Send size={22} />
        <Bookmark size={22} className="ml-auto" />
      </div>
      {/* Caption */}
      <div className="px-3 pb-4 text-sm">
        <p className="font-semibold">{post.displayName || 'Your Name'}</p>
        <p className="mt-0.5 whitespace-pre-wrap text-foreground">{post.text}</p>
        <p className="mt-2 text-xs uppercase text-muted-foreground">Just now</p>
      </div>
    </div>
  );
}

function LinkedInPreview({ post }: { post: SocialPost }) {
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-border bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-3">
        <Avatar name={post.displayName} />
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold">{post.displayName || 'Your Name'}</p>
          <p className="truncate text-xs text-muted-foreground">{post.username ? `@${post.username}` : 'now'}</p>
          <p className="truncate text-xs text-muted-foreground">2m · 🌐</p>
        </div>
        <span className="text-muted-foreground">···</span>
      </div>
      {/* Text */}
      <div className="px-3 pb-3 text-sm whitespace-pre-wrap">
        {post.text}
      </div>
      {/* Image */}
      {post.imageUrl && (
        <img src={post.imageUrl} alt="Post" className="w-full max-h-96 object-cover" />
      )}
      {/* Link card (if no image but link fields filled) */}
      {!post.imageUrl && post.linkUrl && (
        <div className="mx-3 mb-3 overflow-hidden rounded-lg border border-border">
          {post.imageUrl && <img src={post.imageUrl} alt="" className="w-full" />}
          <div className="p-3">
            <p className="truncate text-xs text-muted-foreground">{post.linkUrl}</p>
            <p className="mt-1 font-semibold text-sm">{post.linkTitle || 'Link Title'}</p>
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{post.linkDescription}</p>
          </div>
        </div>
      )}
      {/* Reactions */}
      <div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground">
        <span>👍 42 reactions</span>
        <span>8 comments</span>
      </div>
    </div>
  );
}

function XPreview({ post }: { post: SocialPost }) {
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-border bg-white">
      <div className="flex gap-3 p-3">
        <Avatar name={post.displayName} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-bold">{post.displayName || 'Your Name'}</p>
            <p className="truncate text-xs text-muted-foreground">@{post.username || 'username'} · now</p>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm">{post.text}</p>
          {/* Image */}
          {post.imageUrl && (
            <div className="mt-2 overflow-hidden rounded-xl border border-border">
              <img src={post.imageUrl} alt="Post" className="aspect-16/9 w-full object-cover" style={{ aspectRatio: '16 / 9' }} />
            </div>
          )}
          {/* Link card */}
          {!post.imageUrl && post.linkUrl && (
            <div className="mt-2 overflow-hidden rounded-xl border border-border">
              <div className="p-3">
                <p className="truncate text-xs text-muted-foreground">{post.linkUrl}</p>
                <p className="mt-1 font-semibold text-sm">{post.linkTitle || 'Link Title'}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{post.linkDescription}</p>
              </div>
            </div>
          )}
          {/* Actions */}
          <div className="mt-3 flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-1 text-xs"><MessageCircle size={16} /> 12</span>
            <span className="flex items-center gap-1 text-xs"><Repeat2 size={16} /> 24</span>
            <span className="flex items-center gap-1 text-xs"><ThumbsUp size={16} /> 48</span>
            <span className="flex items-center gap-1 text-xs"><Send size={16} /></span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FacebookPreview({ post }: { post: SocialPost }) {
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-border bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-3">
        <Avatar name={post.displayName} />
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold">{post.displayName || 'Your Name'}</p>
          <p className="truncate text-xs text-muted-foreground">Just now · 🌐</p>
        </div>
        <span className="text-muted-foreground">···</span>
      </div>
      {/* Text */}
      <div className="px-3 pb-3 text-sm whitespace-pre-wrap">
        {post.text}
      </div>
      {/* Image */}
      {post.imageUrl ? (
        <img src={post.imageUrl} alt="Post" className="w-full max-h-96 object-cover" />
      ) : post.linkUrl ? (
        /* Link card */
        <div className="mx-3 mb-3 border-t border-border">
          <div className="bg-muted/50 p-4">
            <p className="truncate text-xs uppercase text-muted-foreground">{post.linkUrl}</p>
            <p className="mt-1 font-semibold text-sm">{post.linkTitle || 'Link Title'}</p>
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{post.linkDescription}</p>
          </div>
        </div>
      ) : null}
      {/* Reactions */}
      <div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground">
        <span>👍 36</span>
        <span>5 comments · 2 shares</span>
      </div>
    </div>
  );
}

function OGPreview({ post }: { post: SocialPost }) {
  const domain = post.linkUrl.replace(/^https?:\/\//, '').split('/')[0] || post.linkUrl;
  return (
    <div className="mx-auto max-w-xl">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Open Graph / Shared Link Preview
      </p>
      <div className="overflow-hidden rounded-xl border border-border bg-white">
        {post.imageUrl && (
          <img src={post.imageUrl} alt="Link preview" className="aspect-[1.91/1] w-full object-cover" style={{ aspectRatio: '1.91 / 1' }} />
        )}
        <div className="bg-muted/30 p-4">
          <p className="truncate text-xs uppercase text-muted-foreground">{domain}</p>
          <p className="mt-1.5 font-heading font-semibold tracking-tight">{post.linkTitle || 'Link Title'}</p>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.linkDescription}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        This is how your link may appear when shared in messaging apps or social cards.
      </p>
    </div>
  );
}

// Inline heart icon (avoid extra lucide import naming conflict)
function HeartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
