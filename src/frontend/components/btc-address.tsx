import useBtcAddress from "@/hooks/useBtcAddress";
import { Skeleton } from "./ui/skeleton";

export function BtcAddress() {
  const { data: address, isPending: isFetchingAddress } = useBtcAddress();

  if (isFetchingAddress || !address) {
    return <Skeleton className="h-[19px] w-[125px] inline-block" />
  }

  return <div className="text-muted-foreground inline-block">
    {address.slice(0, 5)}...{address.slice(-5)}
  </div>
}
