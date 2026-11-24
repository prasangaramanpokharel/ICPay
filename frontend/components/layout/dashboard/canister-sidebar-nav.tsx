"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import useSWR from "swr"
import { Icon } from "@/components/ui/icon"
import { PlusGlassIcon, ArrowUpDownGlassIcon, SearchGlassIcon, LayoutDashboardGlassIcon, TerminalGlassIcon, LayersGlassIcon, FolderGlassIcon, ShieldCheckGlassIcon, SettingsGlassIcon, CheckGlassIcon, UsersCollaborationGlassIcon, CpuGlassIcon, EyeGlassIcon, PowerGlassIcon, ExternalLinkGlassIcon } from "@thesvg/ui-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { MotionHighlight, MotionHighlightItem } from "@/components/ui/motion-highlight"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { useAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSavedCanisterEntries } from "@/hooks/canister/useSavedCanisters"
import { fetchCanisterIndexMeta } from "@/services/canister/controlledCanisters"
import { projectAvatarUriFor } from "@/lib/profile/avatar"
import { shortCanisterId } from "@/lib/canister/savedCanisters"
import { buildCanisterHref } from "@/lib/canister/canisterNav"
import { cn } from "@/lib/ui/utils"

export function CanisterSidebarNav({ canisterId }: { canisterId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations("canisterNav")
  const { identity } = useAuth()
  const principal = identity?.getPrincipal().toText() ?? null
  const savedEntries = useSavedCanisterEntries(principal)
  const [openCommand, setOpenCommand] = useState(false)

  const activeTab = searchParams.get("tab") || "overview"
  const activeSection = searchParams.get("section") || "controllers"

  const currentEntry = savedEntries.find((e) => e.id === canisterId)
  const { data: indexMeta } = useSWR(
    canisterId ? (["canister-index-meta", canisterId] as const) : null,
    ([, id]) => fetchCanisterIndexMeta(id),
    { revalidateOnFocus: false, dedupingInterval: 120_000 },
  )
  const displayName = currentEntry?.name || indexMeta?.name || shortCanisterId(canisterId)
  const avatarUri = useMemo(
    () => projectAvatarUriFor(canisterId || displayName),
    [canisterId, displayName],
  )

  const entriesList = useMemo(() => {
    if (savedEntries.some((e) => e.id === canisterId)) {
      return savedEntries
    }
    return [{ id: canisterId, name: displayName }, ...savedEntries]
  }, [savedEntries, canisterId, displayName])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") ||
        (e.key.toLowerCase() === "f" &&
          !e.metaKey &&
          !e.ctrlKey &&
          !e.altKey &&
          document.activeElement?.tagName !== "INPUT" &&
          document.activeElement?.tagName !== "TEXTAREA")
      ) {
        e.preventDefault()
        setOpenCommand((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const navItems = useMemo(() => {
    return [
      {
        id: "overview",
        label: t("overview"),
        icon: LayoutDashboardGlassIcon,
        href: buildCanisterHref(canisterId, { tab: "overview" }),
        isActive: activeTab === "overview",
      },
      {
        id: "logs",
        label: t("logs"),
        icon: TerminalGlassIcon,
        href: buildCanisterHref(canisterId, { tab: "logs" }),
        isActive: activeTab === "logs",
      },
      {
        id: "snapshots",
        label: t("snapshots"),
        icon: LayersGlassIcon,
        href: buildCanisterHref(canisterId, { tab: "snapshots" }),
        isActive: activeTab === "snapshots",
      },
      {
        id: "assets",
        label: t("assets"),
        icon: FolderGlassIcon,
        href: buildCanisterHref(canisterId, { tab: "assets" }),
        isActive: activeTab === "assets",
      },
      {
        id: "audit",
        label: t("audit"),
        icon: ShieldCheckGlassIcon,
        href: buildCanisterHref(canisterId, { tab: "audit" }),
        isActive: activeTab === "audit",
      },
      {
        id: "settings",
        label: t("settings"),
        icon: SettingsGlassIcon,
        href: buildCanisterHref(canisterId, { tab: "settings", section: activeSection }),
        isActive: activeTab === "settings",
        subItems: [
          {
            id: "controllers",
            label: t("controllers"),
            icon: UsersCollaborationGlassIcon,
            href: buildCanisterHref(canisterId, { tab: "settings", section: "controllers" }),
            isActive: activeTab === "settings" && activeSection === "controllers",
          },
          {
            id: "resources",
            label: t("resources"),
            icon: CpuGlassIcon,
            href: buildCanisterHref(canisterId, { tab: "settings", section: "resources" }),
            isActive: activeTab === "settings" && activeSection === "resources",
          },
          {
            id: "visibility",
            label: t("visibility"),
            icon: EyeGlassIcon,
            href: buildCanisterHref(canisterId, { tab: "settings", section: "visibility" }),
            isActive: activeTab === "settings" && activeSection === "visibility",
          },
          {
            id: "lifecycle",
            label: t("lifecycle"),
            icon: PowerGlassIcon,
            href: buildCanisterHref(canisterId, { tab: "settings", section: "lifecycle" }),
            isActive: activeTab === "settings" && activeSection === "lifecycle",
          },
        ],
      },
    ]
  }, [canisterId, activeTab, activeSection, t])

  const handleSelectTab = (tab: string) => {
    setOpenCommand(false)
    router.replace(buildCanisterHref(canisterId, { tab }))
  }

  const handleSelectSection = (section: string) => {
    setOpenCommand(false)
    router.replace(buildCanisterHref(canisterId, { tab: "settings", section }))
  }

  const handleSwitchCanister = (targetId: string) => {
    setOpenCommand(false)
    router.replace(buildCanisterHref(targetId, { tab: activeTab, section: activeSection }))
  }

  const handleOpenUrl = (url: string) => {
    setOpenCommand(false)
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="px-1 pt-0.5">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex h-10 w-full items-center justify-between gap-2.5 rounded-lg border border-sidebar-border/70 bg-sidebar-accent/15 px-2.5 py-1.5 text-left transition-colors hover:bg-sidebar-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer group"
              />
            }
          >
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <Avatar className="size-6 shrink-0 rounded-md border border-border/60 bg-muted/40 overflow-hidden">
                <AvatarImage src={avatarUri} alt={displayName} className="size-full object-cover" />
                <AvatarFallback className="bg-transparent text-xs font-semibold uppercase text-foreground">
                  {displayName.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-sm font-medium text-foreground tracking-tight" title={displayName}>
                {displayName}
              </span>
            </div>

            <Icon
              icon={ArrowUpDownGlassIcon}
              className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 ml-1.5"
            />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width) min-w-56 p-1">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("canisters")}
              </DropdownMenuLabel>
              {entriesList.map((entry) => {
                const isCurrent = entry.id === canisterId
                const name = entry.name || shortCanisterId(entry.id)
                const itemAvatar = projectAvatarUriFor(entry.id || name)
                return (
                  <DropdownMenuItem
                    key={entry.id}
                    onClick={() => handleSwitchCanister(entry.id)}
                    className="flex items-center justify-between gap-2 px-2 py-1.5 cursor-pointer rounded-lg text-xs"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar className="size-5 shrink-0 border border-border/40 bg-muted/40 overflow-hidden">
                        <AvatarImage src={itemAvatar} alt={name} className="size-full object-cover" />
                        <AvatarFallback className="bg-transparent text-[10px] font-semibold uppercase text-foreground">
                          {name.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-xs font-medium text-foreground">
                          {name}
                        </span>
                        <span className="truncate font-mono text-[10px] text-muted-foreground">
                          {shortCanisterId(entry.id)}
                        </span>
                      </div>
                    </div>
                    {isCurrent && (
                      <Icon icon={CheckGlassIcon} className="size-3.5 text-primary shrink-0" />
                    )}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push("/canister")}
                className="flex items-center gap-2 px-2 py-1.5 cursor-pointer text-xs"
              >
                <Icon icon={FolderGlassIcon} className="size-3.5 text-muted-foreground shrink-0" />
                <span>{t("allCanisters")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/canister/create")}
                className="flex items-center gap-2 px-2 py-1.5 cursor-pointer text-xs"
              >
                <Icon icon={PlusGlassIcon} className="size-3.5 text-muted-foreground shrink-0" />
                <span>{t("createCanister")}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="px-1">
        <button
          type="button"
          onClick={() => setOpenCommand(true)}
          className="flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-sidebar-border/70 bg-sidebar-accent/20 px-2.5 text-xs text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Icon icon={SearchGlassIcon} className="size-3.5" />
            <span>{t("quickSearch")}</span>
          </div>
          <kbd className="pointer-events-none rounded border border-border/50 bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium font-mono text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        <CommandDialog
          open={openCommand}
          onOpenChange={setOpenCommand}
          title={t("commandTitle")}
          description={t("commandDescription")}
        >
          <Command>
            <CommandInput placeholder={t("commandPlaceholder")} />
            <CommandList className="max-h-80 overflow-y-auto p-1">
              <CommandEmpty>{t("noResults")}</CommandEmpty>

              <CommandGroup heading={t("navigation")}>
                <CommandItem onSelect={() => handleSelectTab("overview")}>
                  <Icon icon={LayoutDashboardGlassIcon} className="size-4" />
                  <span>{t("overview")}</span>
                  <CommandShortcut>⌘1</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => handleSelectTab("logs")}>
                  <Icon icon={TerminalGlassIcon} className="size-4" />
                  <span>{t("logs")}</span>
                  <CommandShortcut>⌘2</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => handleSelectTab("snapshots")}>
                  <Icon icon={LayersGlassIcon} className="size-4" />
                  <span>{t("snapshots")}</span>
                  <CommandShortcut>⌘3</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => handleSelectTab("assets")}>
                  <Icon icon={FolderGlassIcon} className="size-4" />
                  <span>{t("assetsExplorer")}</span>
                  <CommandShortcut>⌘4</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => handleSelectTab("audit")}>
                  <Icon icon={ShieldCheckGlassIcon} className="size-4" />
                  <span>{t("auditLog")}</span>
                  <CommandShortcut>⌘5</CommandShortcut>
                </CommandItem>
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading={t("settings")}>
                <CommandItem onSelect={() => handleSelectSection("controllers")}>
                  <Icon icon={UsersCollaborationGlassIcon} className="size-4" />
                  <span>{t("controllers")}</span>
                </CommandItem>
                <CommandItem onSelect={() => handleSelectSection("resources")}>
                  <Icon icon={CpuGlassIcon} className="size-4" />
                  <span>{t("resourcesLimits")}</span>
                </CommandItem>
                <CommandItem onSelect={() => handleSelectSection("visibility")}>
                  <Icon icon={EyeGlassIcon} className="size-4" />
                  <span>{t("visibilityLogs")}</span>
                </CommandItem>
                <CommandItem onSelect={() => handleSelectSection("lifecycle")}>
                  <Icon icon={PowerGlassIcon} className="size-4 text-destructive" />
                  <span>{t("lifecycleDanger")}</span>
                </CommandItem>
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading={t("actions")}>
                <CommandItem onSelect={() => handleOpenUrl(`https://${canisterId}.icp0.io`)}>
                  <Icon icon={ExternalLinkGlassIcon} className="size-4" />
                  <span>{t("visitLiveDapp")}</span>
                </CommandItem>
                <CommandItem onSelect={() => handleOpenUrl(`https://${canisterId}.raw.icp0.io`)}>
                  <Icon icon={ExternalLinkGlassIcon} className="size-4" />
                  <span>{t("visitRawGateway")}</span>
                </CommandItem>
                <CommandItem
                  onSelect={() =>
                    handleOpenUrl(`https://dashboard.internetcomputer.org/canister/${canisterId}`)
                  }
                >
                  <Icon icon={ExternalLinkGlassIcon} className="size-4" />
                  <span>{t("viewOnDashboard")}</span>
                </CommandItem>
              </CommandGroup>

              {savedEntries.length > 1 ? (
                <>
                  <CommandSeparator />
                  <CommandGroup heading={t("switchCanister")}>
                    {savedEntries
                      .filter((entry) => entry.id !== canisterId)
                      .map((entry) => (
                        <CommandItem key={entry.id} onSelect={() => handleSwitchCanister(entry.id)}>
                          <span className="size-2 rounded-full bg-success shrink-0" />
                          <span className="truncate">{entry.name || shortCanisterId(entry.id)}</span>
                          <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                            {shortCanisterId(entry.id)}
                          </span>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </>
              ) : null}
            </CommandList>
          </Command>
        </CommandDialog>
      </div>

      <SidebarGroup className="p-0">
        <SidebarGroupLabel className="h-6 px-2 text-[10px] font-medium text-muted-foreground">
          {t("navigation")}
        </SidebarGroupLabel>

        <SidebarGroupContent>
          <MotionHighlight
            hover
            value={null}
            className="w-full"
            highlightClassName="rounded-lg bg-sidebar-accent/80"
          >
            <SidebarMenu className="gap-0.5">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <MotionHighlightItem asChild value={item.id}>
                    <SidebarMenuButton
                      isActive={item.isActive}
                      render={<Link href={item.href} />}
                      className={cn(
                        "h-8 gap-2.5 rounded-lg px-2.5 text-xs font-medium transition-colors data-active:bg-accent data-active:text-foreground data-active:font-semibold",
                        item.isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon
                        icon={item.icon}
                        className={cn(
                          "size-4 shrink-0 transition-colors",
                          item.isActive
                            ? "text-foreground"
                            : "text-muted-foreground group-hover/menu-button:text-foreground",
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </SidebarMenuButton>
                  </MotionHighlightItem>

                  {item.subItems ? (
                    <SidebarMenuSub className="my-0.5 ml-3.5 border-l border-sidebar-border/60 pl-2">
                      {item.subItems.map((sub) => (
                        <SidebarMenuSubItem key={sub.id}>
                          <SidebarMenuSubButton
                            isActive={sub.isActive}
                            render={<Link href={sub.href} />}
                            className={cn(
                              "h-6 rounded-md px-2 text-[10px] font-normal transition-colors",
                              sub.isActive
                                ? "bg-accent text-foreground font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent/40",
                            )}
                          >
                            <span className="truncate">{sub.label}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </MotionHighlight>
        </SidebarGroupContent>
      </SidebarGroup>
    </div>
  )
}
