import { useMutation } from "@tanstack/react-query";
import { orpcUtils } from "../lib/orpc";
import { AppResult } from "../types";
import { useHistory } from "./useHistory";

interface UseLinkRetrievalProps {
  onSuccess?: (iosApp: AppResult | null, androidApp: AppResult | null) => void;
}

export function useLinkRetrieval(props?: UseLinkRetrievalProps) {
  const { updateInHistory, removeFromHistory } = useHistory();

  const getLinkMutation = useMutation(
    orpcUtils.getLink.mutationOptions({
      onSuccess: (details, variables) => {
        if (details) {
          const iosApp = details.iosId
            ? {
                id: details.iosId,
                name: details.iosName || "",
                icon: details.iosIcon || "",
                developer: "",
              }
            : null;
          const androidApp = details.androidId
            ? {
                id: details.androidId,
                name: details.androidName || "",
                icon: details.androidIcon || "",
                developer: "",
              }
            : null;

          props?.onSuccess?.(iosApp, androidApp);

          updateInHistory(variables.slug, {
            iosName: details.iosName ?? undefined,
            androidName: details.androidName ?? undefined,
          });
        } else {
          removeFromHistory(variables.slug);
          alert(
            "This link no longer exists and has been removed from your history.",
          );
        }
      },
    }),
  );

  const retrieveLink = (slug: string) => {
    getLinkMutation.mutate({ slug });
  };

  return {
    isRetrieving: getLinkMutation.isPending,
    retrieveLink,
  };
}
