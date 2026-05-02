import type { ReactNode } from "react";
import { Skeleton } from "boneyard-js/react";

const bone = "animate-pulse rounded-2xl bg-slate-200/80";

const AuthFallback = () => (
  <div className="bg-cream min-h-screen flex items-center justify-center px-4">
    <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-slate-200/80 animate-pulse" />
      <div className="mt-6 space-y-3">
        <div className={`${bone} h-8 w-2/3 mx-auto`} />
        <div className={`${bone} h-4 w-full`} />
        <div className={`${bone} h-4 w-5/6 mx-auto`} />
      </div>
      <div className="mt-8 space-y-3">
        <div className={`${bone} h-12 w-full`} />
        <div className={`${bone} h-12 w-full`} />
      </div>
    </div>
  </div>
);

const SettingsFallback = () => (
  <div className="max-w-5xl mx-auto">
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className={`${bone} h-6 w-44`} />
        <div className={`${bone} h-4 w-3/4`} />
        <div className="space-y-4 pt-2">
          <div className={`${bone} h-14 w-full`} />
          <div className={`${bone} h-12 w-full`} />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className={`${bone} h-6 w-52`} />
        <div className={`${bone} h-4 w-3/4`} />
        <div className="space-y-4 pt-2">
          <div className={`${bone} h-14 w-full`} />
          <div className={`${bone} h-14 w-full`} />
          <div className={`${bone} h-12 w-full`} />
        </div>
      </div>
    </div>
  </div>
);

const MenuManagerFallback = () => (
  <div className="max-w-7xl mx-auto space-y-8">
    <div className="flex gap-2 border-b flex-wrap pb-4">
      <div className={`${bone} h-12 w-32 rounded-xl`} />
      <div className={`${bone} h-12 w-28 rounded-xl`} />
      <div className={`${bone} h-12 w-32 rounded-xl`} />
      <div className={`${bone} h-12 w-36 rounded-xl`} />
    </div>

    <div className="space-y-4">
      <div className={`${bone} h-11 w-40 rounded-lg`} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
            <div className={`${bone} h-6 w-3/5`} />
            <div className={`${bone} h-4 w-11/12`} />
            <div className="flex gap-2 pt-2">
              <div className={`${bone} h-9 w-20 rounded-full`} />
              <div className={`${bone} h-9 w-20 rounded-full`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ReportsFallback = () => (
  <div className="max-w-7xl mx-auto space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border space-y-4">
          <div className={`${bone} h-4 w-32`} />
          <div className={`${bone} h-10 w-28`} />
        </div>
      ))}
    </div>

    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border space-y-4">
        <div className={`${bone} h-5 w-44`} />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={`${bone} h-10 w-full`} />
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm border space-y-4">
        <div className={`${bone} h-5 w-44`} />
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className={`${bone} h-16 w-20 rounded-xl`} />
          ))}
        </div>
      </div>
    </div>

    <div className="bg-white rounded-2xl p-6 shadow-sm border space-y-4">
      <div className={`${bone} h-5 w-44`} />
      <div className="grid grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className={`${bone} h-4 w-full`} />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className={`${bone} h-11 w-full`} />
        ))}
      </div>
    </div>
  </div>
);

type SkeletonShellProps = {
  loading: boolean;
  children: ReactNode;
};

export const AuthRouteSkeleton = ({ loading, children }: SkeletonShellProps) => (
  <Skeleton name="auth-route" loading={loading} fallback={<AuthFallback />}>
    {children}
  </Skeleton>
);

export const SettingsSkeleton = ({ loading, children }: SkeletonShellProps) => (
  <Skeleton name="settings-page" loading={loading} fallback={<SettingsFallback />}>
    {children}
  </Skeleton>
);

export const MenuManagerSkeleton = ({ loading, children }: SkeletonShellProps) => (
  <Skeleton
    name="menu-manager"
    loading={loading}
    fallback={<MenuManagerFallback />}
  >
    {children}
  </Skeleton>
);

export const ReportsSkeleton = ({ loading, children }: SkeletonShellProps) => (
  <Skeleton name="reports-page" loading={loading} fallback={<ReportsFallback />}>
    {children}
  </Skeleton>
);

const KioskFallback = () => (
  <div className="space-y-6">
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col items-start justify-between gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
        >
          <div className="w-full space-y-2">
            <div className={`${bone} h-5 w-3/4 rounded-md`} />
            <div className={`${bone} h-4 w-1/2 rounded-md`} />
          </div>
          <div className="w-full flex justify-end">
            <div className={`${bone} h-8 w-16 rounded-md`} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const QueueFallback = () => (
  <div className="space-y-6">
    <div className="mb-6 space-y-3">
      <div className={`${bone} h-12 w-72`} />
      <div className={`${bone} h-5 w-96`} />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-200 space-y-4"
        >
          <div className={`${bone} h-4 w-24`} />
          <div className={`${bone} h-12 w-16`} />
        </div>
      ))}
    </div>

    <div className="mb-6 flex flex-wrap gap-3">
      <div className={`${bone} h-10 w-28 rounded-full`} />
      <div className={`${bone} h-10 w-32 rounded-full`} />
    </div>

    <div className="grid gap-5">
      {Array.from({ length: 4 }).map((_, index) => (
        <article
          key={index}
          className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-200 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-3">
              <div className={`${bone} h-3 w-32`} />
              <div className={`${bone} h-8 w-56`} />
            </div>
            <div className={`${bone} h-10 w-28 rounded-full`} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className={`${bone} h-24 w-full rounded-3xl`} />
            <div className={`${bone} h-24 w-full rounded-3xl`} />
          </div>
          <div className="flex justify-end">
            <div className={`${bone} h-11 w-40 rounded-2xl`} />
          </div>
        </article>
      ))}
    </div>
  </div>
);

export const KioskSkeleton = ({ loading, children }: SkeletonShellProps) => (
  <Skeleton name="kiosk-page" loading={loading} fallback={<KioskFallback />}>
    {children}
  </Skeleton>
);

export const QueueSkeleton = ({ loading, children }: SkeletonShellProps) => (
  <Skeleton name="queue-page" loading={loading} fallback={<QueueFallback />}>
    {children}
  </Skeleton>
);