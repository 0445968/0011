import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { ClientAuthSwitcher } from '@/components/portal/ClientAuthSwitcher';
import { LoginServicesMarquee } from '@/components/portal/LoginServicesMarquee';

import { staffAuthConfigured } from '@/lib/admin/auth';
import { getClientAccess } from '@/lib/portal/auth';

export default async function ClientLoginPage({
  searchParams,
}: {
  searchParams?: {
    password?: string;
    error?: string;
  };
}) {
  const access = await getClientAccess();

  if (access.allowed) {
    redirect('/client');
  }

  const passwordUpdated =
    searchParams?.password === 'updated';

  const authError =
    searchParams?.error;

  let authMessage = '';

  if (
    authError === 'not-authorized'
  ) {
    authMessage =
      'This account is not currently assigned to a Bivi client project.';
  } else if (
    authError === 'oauth'
  ) {
    authMessage =
      'Google sign-in could not be completed. Please try again.';
  }

  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-[#080808]
        p-4
        text-white
        sm:p-5
      "
    >
      <div
        className="
          grid
          w-full
          max-w-[1180px]
          overflow-hidden
          rounded-[10px]
          border
          border-white/[0.08]
          bg-[#111111]
          shadow-[0_34px_100px_rgba(0,0,0,0.52)]

          lg:h-[720px]
          lg:min-h-[720px]
          lg:max-h-[720px]
          lg:grid-cols-[390px_minmax(0,1fr)]
        "
      >
        {/* LEFT */}
        <section
          className="
          relative
            flex
            min-h-[680px]
            flex-col
            px-7
            py-8
            sm:px-9

            lg:h-full
            lg:min-h-0
            lg:px-9
            lg:py-8
          "
        >
          <Link
            href="/"
            aria-label="Bivi home"
            className="inline-flex w-fit shrink-0"
          >
            <Image
              src="/images/logo.svg"
              alt="Bivi"
              width={180}
              height={60}
              priority
              className="
                h-auto
                w-[82px]
                brightness-0
                invert
              "
            />
          </Link>

          <div
            className="
              mt-10
              w-full
              max-w-[320px]
              shrink-0
            "
          >
            <p
              className="
                font-mono
                text-[9px]
                uppercase
                tracking-[0.2em]
                text-white/45
              "
            >
              Client portal
            </p>

            <h1
              className="
                mt-3
                font-heading
                text-[30px]
                font-semibold
                leading-[1.02]
                tracking-[-0.04em]
                text-white
              "
            >
              Welcome back.
            </h1>

            <p
              className="
                mt-3
                max-w-[310px]
                text-[13px]
                leading-5
                text-white/50
              "
            >
              Sign in to access your
              projects, files, reviews
              and deliveries.
            </p>

            {passwordUpdated && (
              <div
                className="
                  mt-4
                  rounded-[12px]
                  border
                  border-white/10
                  bg-white/[0.04]
                  px-3.5
                  py-2.5
                  text-[11px]
                  leading-5
                  text-white/60
                "
              >
                Password updated.
                Sign in with your new
                password.
              </div>
            )}

            {authMessage && (
              <div
                role="alert"
                className="
                  mt-4
                  rounded-[12px]
                  border
                  border-red-500/20
                  bg-red-500/10
                  px-3.5
                  py-2.5
                  text-[11px]
                  leading-5
                  text-red-200
                "
              >
                {authMessage}
              </div>
            )}

            <ClientAuthSwitcher
              configured={
                staffAuthConfigured()
              }
            />
          </div>

<div
  className="
    absolute
    bottom-4
    left-9
    right-9
    flex
    items-center
    justify-between
    gap-4
    text-[10px]
    text-white/30
  "
>
  <span>
    © {new Date().getFullYear()} Bivi
  </span>

  <div className="flex gap-4">
    <Link
      href="/privacy"
      className="
        underline
        underline-offset-4
        transition-colors
        hover:text-white/70
      "
    >
      Privacy
    </Link>

    <Link
      href="/terms"
      className="
        underline
        underline-offset-4
        transition-colors
        hover:text-white/70
      "
    >
      Terms
    </Link>
  </div>
</div>
        </section>

        {/* RIGHT */}
        <aside
          className="
            relative
            hidden
            h-full
            min-h-0
            overflow-hidden
            lg:block
          "
        >
          <Image
            src="/images/services/services-hero-03.jpg"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 790px, 0px"
            className="
              object-cover
              object-center
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-black/10
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-y-0
              left-0
              w-[58%]
              bg-gradient-to-r
              from-[#111111]
              via-[#111111]/75
              to-transparent
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              top-0
              h-[24%]
              bg-gradient-to-b
              from-black/28
              to-transparent
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              bottom-0
              h-[32%]
              bg-gradient-to-t
              from-black/72
              via-black/28
              to-transparent
            "
          />

          <div
            className="
              absolute
              bottom-[82px]
              left-12
              z-10
              w-[420px]
              max-w-[62%]
            "
          >
            <div className="flex items-center gap-3">
              <Image
                src="/images/bivi-icon.svg"
                alt=""
                width={36}
                height={36}
                className="
                  h-9
                  w-9
                  brightness-0
                  invert
                "
              />

              <span
                className="
                  font-mono
                  text-[10px]
                  uppercase
                  tracking-[0.19em]
                  text-white/60
                "
              >
                Bivi Client Portal
              </span>
            </div>

            <h2
              className="
                mt-5
                font-heading
                text-[44px]
                font-semibold
                leading-[0.98]
                tracking-[-0.05em]
                text-white
              "
            >
              Everything your
              project needs,
              in one place.
            </h2>

            <p
              className="
                mt-5
                max-w-[400px]
                text-[14px]
                leading-6
                text-white/68
              "
            >
              Follow progress,
              review work, exchange
              files, and stay close
              to what comes next.
            </p>
          </div>

          <div
            className="
              absolute
              inset-x-0
              bottom-0
              z-20
            "
          >
            <LoginServicesMarquee />
          </div>
        </aside>
      </div>
    </main>
  );
}