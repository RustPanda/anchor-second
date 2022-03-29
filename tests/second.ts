import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Second } from "../target/types/second";

describe("second", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.Second as Program<Second>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.rpc.initialize({});
    console.log("Your transaction signature", tx);
  });
});
