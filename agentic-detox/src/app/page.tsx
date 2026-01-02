import DetoxAgent from "@/components/DetoxAgent";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-start justify-center overflow-hidden bg-slate-950 px-6 py-16 text-slate-100 sm:px-12">
      <div className="pointer-events-none absolute inset-x-0 top-[-20%] z-0 mx-auto h-[520px] w-[520px] rounded-full bg-sky-500/20 blur-3xl sm:h-[680px] sm:w-[680px]" />
      <div className="pointer-events-none absolute inset-x-10 bottom-[-30%] z-0 mx-auto h-[480px] w-[480px] rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="relative z-10 flex w-full justify-center">
        <div className="w-full">
          <DetoxAgent />
        </div>
      </div>
    </main>
  );
}
