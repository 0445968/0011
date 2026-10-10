
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { ClientAuthSwitcher } from '@/components/portal/ClientAuthSwitcher';
import { LoginServicesMarquee } from '@/components/portal/LoginServicesMarquee';

import { staffAuthConfigured } from '@/lib/admin/auth';
import { getClientAccess } from '@/lib/portal/auth';
import { publicOrigin } from '@/lib/site/origins';

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

  const authError = searchParams?.error;

  let authMessage = '';

  if (authError === 'not-authorized') {
    authMessage =
      'This account is not currently assigned to a Bivi client project.';
  } else if (authError === 'oauth') {
    authMessage =
      'Google sign-in could not be completed. Please try again.';
  }

  const websiteOrigin = publicOrigin();

  return (
    <main
      className="
        relative
        isolate
        flex
        min-h-screen
        w-full
        items-center
        justify-center
        overflow-hidden
        bg-[#080808]
        text-white
        lg:p-5
      "
    >
      {/* MOBILE / TABLET BACKGROUND */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-0
          lg:hidden
        "
        aria-hidden="true"
      >
        <Image
          src="/images/services/services-hero-03.jpg"
          alt=""
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 0px"
          className="
            object-cover
            object-center
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-black/70
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-b
            from-[#080808]/80
            via-[#080808]/60
            to-[#080808]/90
          "
        />
      </div>

      {/* MAIN LAYOUT */}

      <div
        className="
          relative
          z-10
          grid
          w-full

          lg:h-[720px]
          lg:min-h-[720px]
          lg:max-h-[720px]
          lg:max-w-[1180px]
          lg:grid-cols-[390px_minmax(0,1fr)]
          lg:overflow-hidden
          lg:rounded-[10px]
          lg:border
          lg:border-white/10
          lg:bg-[#111111]
          lg:shadow-[0_34px_100px_rgba(0,0,0,0.52)]
        "
      >
        {/* LOGIN CONTENT */}

        <section
          className="
            relative
            flex
            min-h-[100dvh]
            w-full
            flex-col
            items-center
            px-6
            py-8

            sm:px-10
            sm:py-10

            lg:h-full
            lg:min-h-0
            lg:items-stretch
            lg:px-9
            lg:py-8
          "
        >
          {/* LOGO */}

          <Link
            href={websiteOrigin}
            aria-label="Bivi home"
            className="
              inline-flex
              w-fit
              shrink-0
              items-center
              justify-center
              lg:justify-start
            "
          >
            <Image
              src="/images/logo.svg"
              alt="Bivi"
              width={180}
              height={60}
              priority
              className="
                h-auto
                w-[88px]
                brightness-0
                invert
                lg:w-[82px]
              "
            />
          </Link>

          {/* CENTERED MOBILE LOGIN STAGE */}

          <div
            className="
              mx-auto
              flex
              w-full
              max-w-[360px]
              flex-1
              flex-col
              justify-center
              py-10

              lg:mx-0
              lg:mt-10
              lg:max-w-[320px]
              lg:flex-none
              lg:py-0
            "
          >
            {/* INTRODUCTION */}

            <div
              className="
                text-center
                lg:text-left
              "
            >
              <p
                className="
                  font-mono
                  text-[9px]
                  uppercase
                  tracking-[0.2em]
                  text-white/60

                  lg:text-white/50
                "
              >
                Client portal
              </p>

              <h1
                className="
                  mt-3
                  font-heading
                  text-[34px]
                  font-semibold
                  leading-[1.05]
                  tracking-[-0.04em]
                  text-white

                  sm:text-[38px]

                  lg:text-[30px]
                "
              >
                Welcome back!
              </h1>

              <p
                className="
                  mx-auto
                  mt-3
                  max-w-[320px]
                  text-[13px]
                  leading-5
                  text-white/70

                  lg:mx-0
                  lg:max-w-[310px]
                  lg:text-white/50
                "
              >
                Sign in to access your
                projects.
              </p>
            </div>

            {/* AUTH MESSAGES */}

            {passwordUpdated && (
              <div
                role="status"
                className="
                  mt-4
                  rounded-[12px]
                  border
                  border-white/10
                  bg-white/10
                  px-3.5
                  py-2.5
                  text-center
                  text-[11px]
                  leading-5
                  text-white/80
                  lg:text-left
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
                  text-center
                  text-[11px]
                  leading-5
                  text-red-200
                  lg:text-left
                "
              >
                {authMessage}
              </div>
            )}

            {/* LOGIN FORM */}

            <div className="w-full text-left">
              <ClientAuthSwitcher
                configured={staffAuthConfigured()}
              />
            </div>
          </div>

          {/* FOOTER */}

          <div
            className="
              mt-auto
              flex
              w-full
              max-w-[360px]
              shrink-0
              flex-wrap
              items-center
              justify-center
              gap-x-5
              gap-y-2
              text-[10px]
              text-white/50

              lg:absolute
              lg:bottom-4
              lg:left-9
              lg:right-9
              lg:mt-0
              lg:w-auto
              lg:max-w-none
              lg:justify-between
              lg:text-white/30
            "
          >
            <span>
              © {new Date().getFullYear()} Bivi
            </span>

            <div className="flex gap-4">
              <Link
                href={`${websiteOrigin}/privacy`}
                className="
                  underline
                  underline-offset-4
                  transition-colors
                  hover:text-white
                "
              >
                Privacy
              </Link>

              <Link
                href={`${websiteOrigin}/terms`}
                className="
                  underline
                  underline-offset-4
                  transition-colors
                  hover:text-white
                "
              >
                Terms
              </Link>
            </div>
          </div>
        </section>

        {/* DESKTOP RIGHT IMAGE */}

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
              via-[#111111]/70
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
              from-black/30
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
              from-black/70
              via-black/30
              to-transparent
            "
          />

          {/* DESKTOP FEATURE TEXT */}

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
                text-white/70
              "
            >
              Follow progress,
              review work, exchange
              files, and stay close
              to what comes next.
            </p>
          </div>

          {/* SERVICES MARQUEE */}

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
