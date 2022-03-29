use anchor_lang::prelude::*;

declare_id!("3kDnzvRdJtEPV5zUHJSJRxqHXueW5UcJEdxbs4b5iKrN");

#[program]
pub mod second {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> {
        let data_account = &mut ctx.accounts.data_account;
        data_account.data = data;
        msg!("it's my first solana program");
        Ok(())
    }

    pub fn update(ctx: Context<Update>, data: u64) -> Result<()> {
        let data_account = &mut ctx.accounts.data_account;
        data_account.data = data;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 8)]
    pub data_account: Account<'info, DataAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub data_account: Account<'info, DataAccount>,
}

#[account]
pub struct DataAccount {
    pub data: u64,
}
