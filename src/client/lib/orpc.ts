import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { RouterClient } from "@orpc/server";
import type { AppRouter } from "../../server/router";

const link = new RPCLink({
  url: window.location.origin + "/api/rpc",
});

const orpcClient: RouterClient<AppRouter> = createORPCClient(link);
export const orpcUtils = createTanstackQueryUtils(orpcClient);
