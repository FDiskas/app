import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { orpcUtils } from "../lib/orpc";
import { AppResult, CreatedLink } from "../types";
import { useHistory } from "./useHistory";

interface UseLinkGenerationProps {
  onSuccess?: (link: CreatedLink) => void;
}

export function useLinkGeneration(props?: UseLinkGenerationProps) {
  const { saveToHistory } = useHistory();
  const [createdLink, setCreatedLink] = useState<CreatedLink | null>(null);

  const createLinkMutation = useMutation(
    orpcUtils.createShortLink.mutationOptions({
      onSuccess: (res) => {
        setCreatedLink(res);
        saveToHistory(res);
        props?.onSuccess?.(res);
      },
      onError: (err) => {
        console.error(err);
        alert("Failed to save link.");
      },
    }),
  );

  const generateLink = (
    selectedIos: AppResult | null,
    selectedAndroid: AppResult | null,
  ) => {
    createLinkMutation.mutate({
      iosId: selectedIos?.id,
      iosName: selectedIos?.name,
      iosIcon: selectedIos?.icon,
      androidId: selectedAndroid?.id,
      androidName: selectedAndroid?.name,
      androidIcon: selectedAndroid?.icon,
    });
  };

  const resetLink = () => {
    setCreatedLink(null);
  };

  return {
    createdLink,
    isGenerating: createLinkMutation.isPending,
    generateLink,
    resetLink,
  };
}
