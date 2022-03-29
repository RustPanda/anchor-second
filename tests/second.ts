import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { expect } from "chai";
import { Second } from "../target/types/second";

const { SystemProgram } = anchor.web3;

describe("second", () => {
  // Use a local provider.
  const provider = anchor.Provider.local();

  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  // The program to execute.
  const program = anchor.workspace.Second as Program<Second>;

  // The Account to create.
  const dataAccount = anchor.web3.Keypair.generate();

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize(new anchor.BN(123))
      .accounts({
        dataAccount: dataAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([dataAccount])
      .rpc();

    let data = await program.account.dataAccount.fetch(dataAccount.publicKey);

    expect(data.data.toNumber()).to.equal(123);


    console.log("Your transaction signature", tx);
  });
});
