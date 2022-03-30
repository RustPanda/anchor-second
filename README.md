# Создаем первый аккаунт с полем data
В этом уроке я попытаюсь:
- Создать свой первый аккаунт
- Обновлю метод инициализации
- Добавлю метод обновления поля data
- Правлю тесты
- Залью свою программу в devnet

## Создаю свой первый Account
Смарт контракт/программа не может изменять данные в своем аккаунту, она должна хранить свое состояние в другом Account.
Для этого я объявлю новый аккаунт
```rust
#[account]
pub struct DataAccount {
    pub data: u64,
}
```

## Добавлю инициализацию этого акаунта в метод Initialize
### Необходимые аккаунты для этого: 
```rust

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 8)]
    pub data_account: Account<'info, DataAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
```
### Сам метод:
```rust
pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> {
    let data_account = &mut ctx.accounts.data_account;
    data_account.data = data;
    msg!("it's my first solana program");
    Ok(())
}
```

За создание акаунта с поле `data` платит клиент.
Как я понял, для инициализации мне надо вызвать rpc метод у system программы, но anchor делает все за нас.

## Добавлю новый метод для обновления поля `data`
### Необходимые аккаунты для этого: 
```rust
#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub data_account: Account<'info, DataAccount>,
}
```
### Сам метод:
```rust
pub fn update(ctx: Context<Update>, data: u64) -> Result<()> {
    let data_account = &mut ctx.accounts.data_account;
    data_account.data = data;
    Ok(())
}
```

Я указал, что data_accaunt является mut, я буду менять в нем поле data.
В методе `update` я просто записываю в поле акауна `data` новые данные.

## Обновление тестов
В тестах мне необходимо создать новый keypair для data_account, создать provider для получения wallet, передать sistem program

```ts
const { SystemProgram } = anchor.web3;

describe("second", () => {
  // Use provider.
  const provider = anchor.Provider.env();
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

  it("Data updated!", async () => {
    // Add your test here.
    const tx = await program.methods.update(new anchor.BN(321))
      .accounts({
        dataAccount: dataAccount.publicKey,
      })
      .rpc();

    let data = await program.account.dataAccount.fetch(dataAccount.publicKey);

    expect(data.data.toNumber()).to.equal(321);


    console.log("Your transaction signature", tx);
  });
});
```

## Тестирую программу локально
Для запуска тестов выполняю
```sh
$ anchor test
```
вот что мне выводит он в терминал
```sh
➜  second git:(main) ✗ anchor test
BPF SDK: /home/<USER>/.local/share/solana/install/releases/1.9.13/solana-release/bin/sdk/bpf
cargo-build-bpf child: rustup toolchain list -v
cargo-build-bpf child: cargo +bpf build --target bpfel-unknown-unknown --release
    Finished release [optimized] target(s) in 0.30s
cargo-build-bpf child: /home/<USER>/.local/share/solana/install/releases/1.9.13/solana-release/bin/sdk/bpf/dependencies/bpf-tools/llvm/bin/llvm-readelf --dyn-symbols /home/<USER>/anchor-lessons/second/target/deploy/second.so

To deploy this program:
  $ solana program deploy /home/<USER>/anchor-lessons/second/target/deploy/second.so
The program address will default to this keypair (override with --program-id):
  /home/<USER>/anchor-lessons/second/target/deploy/second-keypair.json
yarn run v1.22.10
warning package.json: No license field
$ /home/<USER>/anchor-lessons/second/node_modules/.bin/ts-mocha -p ./tsconfig.json -t 1000000 'tests/**/*.ts'


  second
Your transaction signature 5awPs1nVo7Uat5RT2dG3KpbJprFyBhNEewD3AsuwLkvnMqSaAqCwong4faE7tKHp65KvZW8ThsGau3BJKBFaQBy5
    ✔ Is initialized! (248ms)
Your transaction signature ak1iApHfHQYFtCeJsSA2RHAYeZBLUjh5AyB88fVkhcuufWJmcneUH6tB9T6czMxY8PkVxqXYwWQ77A8EUAFAPbL
    ✔ Data updated! (415ms)


  2 passing (670ms)

Done in 7.38s.
```
Оба теста завершились успешно

## Запуск тестов в devnet
Для запуска в devnet мне необходимо отредактировать [Acnhor.toml](./Anchor.toml)

```toml
[features]
seeds = false

[programs.devnet]
second = "3kDnzvRdJtEPV5zUHJSJRxqHXueW5UcJEdxbs4b5iKrN"

[registry]
url = "https://anchor.projectserum.com"

[provider]
cluster = "devnet"
wallet = "/home/<USER>/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
```

И думаю стоить добавить пару монет моему кошельку
```sh
$ solana airdrop 2  /home/<user>/.config/solana/id.json
```

Запускаю test
```sh
$ anchor test
```
Вот что получаю в терминал
```sh
➜  second git:(main) ✗ anchor test                                             
BPF SDK: /home/<USER>/.local/share/solana/install/releases/1.9.13/solana-release/bin/sdk/bpf
cargo-build-bpf child: rustup toolchain list -v
cargo-build-bpf child: cargo +bpf build --target bpfel-unknown-unknown --release
    Finished release [optimized] target(s) in 0.31s
cargo-build-bpf child: /home/<USER>/.local/share/solana/install/releases/1.9.13/solana-release/bin/sdk/bpf/dependencies/bpf-tools/llvm/bin/llvm-readelf --dyn-symbols /home/<USER>/anchor-lessons/second/target/deploy/second.so

To deploy this program:
  $ solana program deploy /home/<USER>/anchor-lessons/second/target/deploy/second.so
The program address will default to this keypair (override with --program-id):
  /home/<USER>/anchor-lessons/second/target/deploy/second-keypair.json
Deploying workspace: https://api.devnet.solana.com
Upgrade authority: /home/<USER>/.config/solana/id.json
Deploying program "second"...
Program path: /home/<USER>/anchor-lessons/second/target/deploy/second.so...
Program Id: 3kDnzvRdJtEPV5zUHJSJRxqHXueW5UcJEdxbs4b5iKrN

Deploy success
yarn run v1.22.10
warning package.json: No license field
$ /home/<USER>/anchor-lessons/second/node_modules/.bin/ts-mocha -p ./tsconfig.json -t 1000000 'tests/**/*.ts'


  second
Your transaction signature 5MNUR9nbRbaaYkenADzUYgQCxZ8P7RnwvAcErainAfazCqZxJLpS3w1t6KfXCFWBRoHaNV2rP8dt3yNwGg5SZf75
    ✔ Is initialized! (3642ms)
Your transaction signature 3xWBbiiEAXfTUBC51E5qq5ra3NSpaZLpiP7JzVGqeqX9ZTrphvkpTuBbf1YjSuTz5CwhUQggM3cHLbPHe1fmHWLf
    ✔ Data updated! (2659ms)


  2 passing (6s)

Done in 12.49s.
```

Ура, я создал свой первый state для программы solana, да еще и залил все это в devnet)))