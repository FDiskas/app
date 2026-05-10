import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { AppRouter } from "../../server/router";

const link = new RPCLink({
    url: window.location.origin + "/api/rpc",
});

export const orpc = createORPCClient<AppRouter>(link);
