"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Icon } from "@/components/ui/icon"
import { ArrowRightGlassIcon } from "@thesvg/ui-react"
import { Button } from "@/components/ui/button"
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text"
import { useAuth } from "@/components/auth/auth-provider"
import { fetchCourses } from "@/services/academy/client"

export function AcademyHero() {
  const { isAuthenticated } = useAuth()
  const [stats, setStats] = useState({
    hours: 6,
    modules: 1,
    featuredTitle: "",
  })

  useEffect(() => {
    let active = true
    fetchCourses(false)
      .then((courses) => {
        if (!active) return
        const totalHours = courses.reduce((acc, c) => acc + (c.total_hours || 0), 0)
        setStats({
          hours: totalHours > 0 ? totalHours : 6,
          modules: courses.length > 0 ? courses.length : 1,
          featuredTitle: courses[0]?.title ? `· ${courses[0].title}` : "",
        })
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-background py-16 md:py-24 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 md:px-6 lg:grid-cols-12 lg:items-center lg:gap-16">
        <div className="space-y-6 lg:col-span-7">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="#courses"
              className="group inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 py-1 pl-1.5 pr-2.5 text-xs font-medium text-foreground shadow-xs backdrop-blur-xs transition-all duration-200 hover:border-border hover:bg-card hover:shadow-sm"
            >
              <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary dark:bg-primary/20">
                New
              </span>
              <AnimatedShinyText className="inline-flex items-center gap-1.5 text-xs">
                <span className="font-medium text-foreground">Course Academy</span>
                {stats.featuredTitle && (
                  <span className="hidden text-muted-foreground sm:inline">
                    {stats.featuredTitle}
                  </span>
                )}
              </AnimatedShinyText>
              <Icon
                icon={ArrowRightGlassIcon}
                className="size-3 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          <p className="shimmer text-xs font-semibold uppercase tracking-[0.24em] text-primary shimmer-duration-3000">
            ICPay Developer Academy
          </p>

          <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-[3.5rem] lg:leading-[1.08]">
            Master Canister Engineering, Storage & Web3 Fintech
          </h1>

          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Production-grade curriculum for building on the Internet Computer. Learn orthogonal persistence in Motoko, zero-egress S3 cloud architectures with ICBucket, and passkey authentication with Internet Identity.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              size="lg"
              className="gap-2 rounded-full px-6 font-semibold shadow-md"
              nativeButton={false}
              render={<Link href="#courses" />}
            >
              <span>Explore Courses</span>
              <Icon icon={ArrowRightGlassIcon} className="size-4" />
            </Button>

            {isAuthenticated ? (
              <Button
                size="lg"
                variant="outline"
                className="gap-2 rounded-full px-5 font-semibold"
                nativeButton={false}
                render={<Link href="/courses" />}
              >
                <span>My Courses</span>
                <Icon icon={ArrowRightGlassIcon} className="size-3.5" />
              </Button>
            ) : (
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-5 font-medium"
                nativeButton={false}
                render={<Link href="#curriculum" />}
              >
                Curriculum Outline
              </Button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-6 border-t border-border/60 pt-8">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Curriculum</p>
              <p className="mt-1 text-xl font-bold tracking-tight text-foreground md:text-2xl">
                {stats.hours}+ Hours
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Courses</p>
              <p className="mt-1 text-xl font-bold tracking-tight text-foreground md:text-2xl">
                {stats.modules} {stats.modules === 1 ? "Track" : "Tracks"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Credentials</p>
              <p className="mt-1 text-xl font-bold tracking-tight text-foreground md:text-2xl">
                Soulbound
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center lg:col-span-5">
          <div className="relative mx-auto flex w-full max-w-md items-center justify-center bg-transparent sm:max-w-lg lg:max-w-xl">
            <Image
              src="/images/pages/icacademy/hero.png"
              alt="ICAcademy Hero"
              width={680}
              height={680}
              priority
              className="size-full object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
