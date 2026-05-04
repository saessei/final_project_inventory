import type { ReactNode } from "react";
import { Skeleton } from "boneyard-js/react";

const bone = "animate-pulse rounded-xl bg-slate-200/60";

const AuthFallback = () => (
  <div className="bg-cream min-h-screen flex items-center justify-center px-4">
    <div className="w-full max-w-md rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm">
      <div className="mx-auto h-16 w-16 rounded-[1.25rem] bg-slate-200/60 animate-pulse" />
      <div className="mt-8 space-y-4">
        <div className={`${bone} h-8 w-2/3 mx-auto`} />
        <div className={`${bone} h-4 w-full`} />
        <div className={`${bone} h-4 w-5/6 mx-auto`} />
      </div>
      <div className="mt-10 space-y-3">
        <div className={`${bone} h-12 w-full rounded-2xl`} />
        <div className={`${bone} h-12 w-full rounded-2xl`} />
      </div>
    </div>
  </div>
);

const SettingsFallback = () => (
  <div className="max-w-5xl mx-auto">
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm space-y-6">
        <div className={`${bone} h-6 w-44`} />
        <div className={`${bone} h-4 w-3/4`} />
        <div className="space-y-4 pt-2">
          <div className={`${bone} h-14 w-full rounded-2xl`} />
          <div className={`${bone} h-12 w-full rounded-2xl`} />
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm space-y-6">
        <div className={`${bone} h-6 w-52`} />
        <div className={`${bone} h-4 w-3/4`} />
        <div className="space-y-4 pt-2">
          <div className={`${bone} h-14 w-full rounded-2xl`} />
          <div className={`${bone} h-14 w-full rounded-2xl`} />
          <div className={`${bone} h-12 w-full rounded-2xl`} />
        </div>
      </div>
    </div>
  </div>
);

const MenuManagerFallback = () => (
  <div className="space-y-6">
    <div className={`${bone} h-11 w-40 rounded-2xl`} />
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-slate-100 bg-white p-5 space-y-4 shadow-sm">
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
);

const ReportsFallback = () => (
  <div className="max-w-7xl mx-auto space-y-8">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-4">
          <div className={`${bone} h-4 w-32`} />
          <div className={`${bone} h-10 w-28 rounded-2xl`} />
        </div>
      ))}
    </div>

    <div className="grid lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-4">
        <div className={`${bone} h-5 w-44`} />
        <div className="space-y-3 pt-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={`${bone} h-10 w-full rounded-xl`} />
          ))}
        </div>
      </div>
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-4">
        <div className={`${bone} h-5 w-44`} />
        <div className="flex flex-wrap gap-3 pt-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className={`${bone} h-16 w-20 rounded-2xl`} />
          ))}
        </div>
      </div>
    </div>

    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-6">
      <div className={`${bone} h-5 w-44`} />
      <div className="grid grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className={`${bone} h-4 w-full`} />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className={`${bone} h-11 w-full rounded-xl`} />
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
  <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-4 xl:gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
    {Array.from({ length: 12 }).map((_, index) => (
      <div
        key={index}
        className="group relative flex h-[140px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm"
      >
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3">
            <div className={`${bone} h-3 w-16 rounded-full`} />
            <div className={`${bone} h-3 w-20 rounded-full`} />
          </div>
          <div className={`${bone} h-10 w-11/12 rounded-2xl`} />
        </div>

        <div className="w-full flex items-center justify-between mt-auto pt-3 border-t border-slate-100/80">
          <div className="flex flex-col gap-2">
            <div className={`${bone} h-3 w-20 rounded-full`} />
            <div className={`${bone} h-6 w-16 rounded-full`} />
          </div>
          <div className={`${bone} h-9 w-20 rounded-xl`} />
        </div>
      </div>
    ))}
  </div>
);

const QueueSummaryFallback = () => (
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
);

const QueueCardsFallback = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
);

export const KioskSkeleton = ({ loading, children }: SkeletonShellProps) => (
  <Skeleton name="kiosk-page" loading={loading} fallback={<KioskFallback />}>
    {children}
  </Skeleton>
);

export const QueueSummarySkeleton = ({ loading, children }: SkeletonShellProps) => (
  <Skeleton name="queue-summary" loading={loading} fallback={<QueueSummaryFallback />}>
    {children}
  </Skeleton>
);

export const QueueCardsSkeleton = ({ loading, children }: SkeletonShellProps) => (
  <Skeleton name="queue-cards" loading={loading} fallback={<QueueCardsFallback />}>
    {children}
  </Skeleton>
);