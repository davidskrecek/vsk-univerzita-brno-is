import Spinner from "@/components/ui/Feedback/Spinner";

export default function Loading() {
  return (
    <div className="w-full min-h-[40vh] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}


