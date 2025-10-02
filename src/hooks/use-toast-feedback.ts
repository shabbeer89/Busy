import { useToast } from "@/components/ui/toast";

export function useToastFeedback() {
  const { toast } = useToast();

  const showSuccess = (title: string, description?: string) => {
    toast({
      variant: "success",
      title,
      description,
    });
  };

  const showError = (title: string, description?: string) => {
    toast({
      variant: "destructive",
      title,
      description,
    });
  };

  const showWarning = (title: string, description?: string) => {
    toast({
      variant: "warning",
      title,
      description,
    });
  };

  const showInfo = (title: string, description?: string) => {
    toast({
      title,
      description,
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}