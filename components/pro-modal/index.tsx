import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CheckCheck } from "lucide-react";

export const ProModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const handleProClick = () => {
    window.open("https://huggingface.co/subscribe/pro?from=DeepSite", "_blank");
    onClose(false);
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[425px] rounded-3xl! p-0! overflow-hidden"
      >
        <DialogTitle className="hidden" />
        <header className="bg-linear-to-b from-indigo-500/25 dark:from-indigo-500/40 to-background px-6 pt-6">
          <div className="flex items-center justify-start -space-x-4 mb-5">
            <div className="size-14 rounded-full bg-pink-200 shadow-2xs flex items-center justify-center text-3xl opacity-50">
              🚀
            </div>
            <div className="size-16 rounded-full bg-amber-200 shadow-2xl flex items-center justify-center text-4xl z-2">
              🤩
            </div>
            <div className="size-14 rounded-full bg-sky-200 shadow-2xs flex items-center justify-center text-3xl opacity-50">
              🥳
            </div>
          </div>
          <h2 className="text-2xl font-bold text-primary">
            Only $9 to enhance your possibilities
          </h2>
          <p className="text-muted-foreground text-base mt-2 max-w-sm">
            It seems like you have reached the monthly free limit of DeepSite.
          </p>
        </header>
        <main className="flex flex-col items-start text-left relative px-6 pb-6">
          <div className="w-1/2 h-px bg-accent/70 my-4"></div>
          <p className="text-lg mt-3 text-primary font-semibold">
            Upgrade to a <ProTag className="mx-1" /> Account, and unlock your
            DeepSite high quota access ⚡
          </p>
          <ul className="mt-3 space-y-1 text-muted-foreground">
            <li className="text-sm text-muted-foreground space-x-2 flex items-center justify-start gap-2 mb-3">
              You&apos;ll also unlock some Hugging Face PRO features, like:
            </li>
            <li className="text-sm space-x-2 flex items-center justify-start gap-2">
              <CheckCheck className="text-emerald-500 size-4" />
              Get acces to thousands of AI app (ZeroGPU) with high quota
            </li>
            <li className="text-sm space-x-2 flex items-center justify-start gap-2">
              <CheckCheck className="text-emerald-500 size-4" />
              Get exclusive early access to new features and updates
            </li>
            <li className="text-sm space-x-2 flex items-center justify-start gap-2">
              <CheckCheck className="text-emerald-500 size-4" />
              Get free credits across all Inference Providers
            </li>
            <li className="text-sm text-muted-foreground space-x-2 flex items-center justify-start gap-2 mt-3">
              ... and lots more!
            </li>
          </ul>
          <Button
            variant="default"
            size="lg"
            tabIndex={-1}
            className="w-full mt-8"
            onClick={handleProClick}
          >
            Subscribe to PRO ($9/month)
          </Button>
        </main>
      </DialogContent>
    </Dialog>
  );
};

export const ProTag = ({
  className,
  ...props
}: {
  className?: string;
  onClick?: () => void;
}) => (
  <span
    className={`${className} ${
      props.onClick ? "cursor-pointer" : ""
    } bg-linear-to-br shadow-green-500/10 dark:shadow-green-500/20 inline-block -skew-x-12 from-pink-500 via-green-400 to-yellow-400 text-xs font-bold text-black shadow-lg rounded-md px-2.5 py-[3px]`}
    {...props}
  >
    PRO
  </span>
);
