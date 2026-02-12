import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="page-shell flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="font-display text-[8rem] leading-none text-fg/[0.06] md:text-[12rem]">
        404
      </div>
      <h1 className="font-display text-2xl font-normal text-fg md:text-3xl">Page missing</h1>
      <p className="mt-3 text-sm text-fg/80">This route is not available.</p>
      <div className="mt-6">
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
