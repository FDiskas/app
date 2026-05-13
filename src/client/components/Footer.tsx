import React from "react";
import { useQuery } from "@tanstack/react-query";
import { orpcUtils } from "../lib/orpc";

export function Footer() {
  const { data } = useQuery(
    orpcUtils.getStats.queryOptions({
      input: {},
      staleTime: 60_000,
    }),
  );

  return (
    <footer className="mt-12 text-slate-500 text-[10px] font-bold uppercase tracking-widest text-center opacity-40 space-y-1">
      {data && (
        <div>
          {data.total.toLocaleString()} link{data.total === 1 ? "" : "s"} stored
        </div>
      )}
      <div>
        Powered by <a href="/" className="text-slate-500">AppLink</a>
        {" · "}
        <a
          href="https://github.com/FDiskas/app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-500 hover:text-slate-300"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
