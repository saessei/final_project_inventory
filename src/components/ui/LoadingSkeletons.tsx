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
  <div className="bg-cream min-h-screen text-dark-brown font-quicksand">
    <div className="fixed top-0 left-0 h-screen w-64 z-10 hidden lg:block">
      <div className={`${bone} h-full w-full rounded-none`} />
    </div>

    <main className="ml-0 lg:ml-64 h-screen overflow-y-auto no-scrollbar p-4 lg:p-6 pt-16 lg:pt-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 space-y-3">
          <div className={`${bone} h-10 w-80`} />
          <div className={`${bone} h-5 w-96`} />
        </div>

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
    </main>
  </div>
);

const MenuManagerFallback = () => (
  <div className="bg-cream min-h-screen text-dark-brown font-quicksand">
    <div className="fixed top-0 left-0 h-screen w-64 z-10 hidden lg:block">
      <div className={`${bone} h-full w-full rounded-none`} />
    </div>

    <main className="ml-0 lg:ml-64 h-screen overflow-y-auto no-scrollbar p-4 lg:p-6 pt-20 lg:pt-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-3">
          <div className={`${bone} h-10 w-72`} />
          <div className={`${bone} h-5 w-96`} />
        </div>

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
    </main>
  </div>
);

const ReportsFallback = () => (
  <div className="bg-cream min-h-screen text-dark-brown font-quicksand">
    <div className="fixed top-0 left-0 h-screen w-64 z-10 hidden lg:block">
      <div className={`${bone} h-full w-full rounded-none`} />
    </div>

    <main className="ml-0 lg:ml-64 h-screen overflow-y-auto no-scrollbar p-4 lg:p-6 pt-28 lg:pt-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="space-y-3">
            <div className={`${bone} h-10 w-56`} />
            <div className={`${bone} h-5 w-72`} />
          </div>
          <div className="flex flex-wrap gap-3">
            <div className={`${bone} h-12 w-56 rounded-xl`} />
            <div className={`${bone} h-12 w-32 rounded-xl`} />
            <div className={`${bone} h-12 w-12 rounded-xl`} />
          </div>
        </div>

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
    </main>
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