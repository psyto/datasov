use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod datasov_solana {
    use super::*;

    /// Initialize the DataSov marketplace
    pub fn initialize_marketplace(
        ctx: Context<InitializeMarketplace>,
        marketplace_fee_basis_points: u16,
    ) -> Result<()> {
        let marketplace = &mut ctx.accounts.marketplace;
        marketplace.authority = ctx.accounts.authority.key();
        marketplace.fee_basis_points = marketplace_fee_basis_points;
        marketplace.total_listings = 0;
        marketplace.total_volume = 0;
        marketplace.bump = ctx.bumps.marketplace;
        
        msg!("DataSov marketplace initialized with fee: {} basis points", marketplace_fee_basis_points);
        Ok(())
    }

    /// Create a data NFT listing
    pub fn create_data_listing(
        ctx: Context<CreateDataListing>,
        listing_id: u64,
        price: u64,
        data_type: DataType,
        description: String,
    ) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        let marketplace = &mut ctx.accounts.marketplace;
        
        listing.id = listing_id;
        listing.owner = ctx.accounts.owner.key();
        listing.price = price;
        listing.data_type = data_type;
        listing.description = description;
        listing.is_active = true;
        listing.created_at = Clock::get()?.unix_timestamp;
        listing.bump = ctx.bumps.listing;
        
        marketplace.total_listings += 1;
        
        msg!("Data listing created with ID: {} and price: {} lamports", listing_id, price);
        Ok(())
    }

    /// Purchase data NFT
    pub fn purchase_data(
        ctx: Context<PurchaseData>,
        listing_id: u64,
    ) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        let marketplace = &mut ctx.accounts.marketplace;
        
        require!(listing.is_active, ErrorCode::ListingNotActive);
        require!(listing.id == listing_id, ErrorCode::InvalidListingId);
        
        let purchase_amount = listing.price;
        let fee_amount = (purchase_amount as u128)
            .checked_mul(marketplace.fee_basis_points as u128)
            .ok_or(error!(ErrorCode::ArithmeticOverflow))?
            .checked_div(10000)
            .ok_or(error!(ErrorCode::ArithmeticOverflow))? as u64;
        let owner_amount = purchase_amount.checked_sub(fee_amount)
            .ok_or(error!(ErrorCode::ArithmeticOverflow))?;
        
        // Transfer payment to owner
        let cpi_accounts = Transfer {
            from: ctx.accounts.buyer_token_account.to_account_info(),
            to: ctx.accounts.owner_token_account.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, owner_amount)?;
        
        // Transfer fee to marketplace
        if fee_amount > 0 {
            let fee_cpi_accounts = Transfer {
                from: ctx.accounts.buyer_token_account.to_account_info(),
                to: ctx.accounts.marketplace_token_account.to_account_info(),
                authority: ctx.accounts.buyer.to_account_info(),
            };
            let fee_cpi_program = ctx.accounts.token_program.to_account_info();
            let fee_cpi_ctx = CpiContext::new(fee_cpi_program, fee_cpi_accounts);
            token::transfer(fee_cpi_ctx, fee_amount)?;
        }
        
        // Update listing and marketplace
        listing.is_active = false;
        listing.buyer = Some(ctx.accounts.buyer.key());
        listing.sold_at = Some(Clock::get()?.unix_timestamp);
        
        marketplace.total_volume += purchase_amount;
        
        msg!("Data purchased successfully. Listing ID: {}, Amount: {} lamports", listing_id, purchase_amount);
        Ok(())
    }

    /// Update listing price
    pub fn update_listing_price(
        ctx: Context<UpdateListingPrice>,
        new_price: u64,
    ) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        
        require!(listing.is_active, ErrorCode::ListingNotActive);
        require!(listing.owner == ctx.accounts.owner.key(), ErrorCode::Unauthorized);
        
        listing.price = new_price;
        
        msg!("Listing price updated to: {} lamports", new_price);
        Ok(())
    }

    /// Cancel listing
    pub fn cancel_listing(
        ctx: Context<CancelListing>,
    ) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        
        require!(listing.is_active, ErrorCode::ListingNotActive);
        require!(listing.owner == ctx.accounts.owner.key(), ErrorCode::Unauthorized);
        
        listing.is_active = false;
        listing.cancelled_at = Some(Clock::get()?.unix_timestamp);
        
        msg!("Listing cancelled successfully");
        Ok(())
    }

    /// Withdraw marketplace fees
    pub fn withdraw_fees(
        ctx: Context<WithdrawFees>,
        amount: u64,
    ) -> Result<()> {
        let marketplace = &mut ctx.accounts.marketplace;
        
        require!(marketplace.authority == ctx.accounts.authority.key(), ErrorCode::Unauthorized);
        
        let cpi_accounts = Transfer {
            from: ctx.accounts.marketplace_token_account.to_account_info(),
            to: ctx.accounts.authority_token_account.to_account_info(),
            authority: ctx.accounts.marketplace.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let seeds = &[
            b"marketplace",
            &[marketplace.bump],
        ];
        let signer = &[&seeds[..]];
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, amount)?;
        
        msg!("Fees withdrawn: {} lamports", amount);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(marketplace_fee_basis_points: u16)]
pub struct InitializeMarketplace<'info> {
    #[account(
        init,
        payer = authority,
        space = Marketplace::LEN,
        seeds = [b"marketplace"],
        bump
    )]
    pub marketplace: Account<'info, Marketplace>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(listing_id: u64)]
pub struct CreateDataListing<'info> {
    #[account(
        init,
        payer = owner,
        space = DataListing::LEN,
        seeds = [b"listing", listing_id.to_le_bytes().as_ref()],
        bump
    )]
    pub listing: Account<'info, DataListing>,
    
    #[account(
        mut,
        seeds = [b"marketplace"],
        bump = marketplace.bump
    )]
    pub marketplace: Account<'info, Marketplace>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(listing_id: u64)]
pub struct PurchaseData<'info> {
    #[account(
        mut,
        seeds = [b"listing", listing_id.to_le_bytes().as_ref()],
        bump = listing.bump
    )]
    pub listing: Account<'info, DataListing>,
    
    #[account(
        mut,
        seeds = [b"marketplace"],
        bump = marketplace.bump
    )]
    pub marketplace: Account<'info, Marketplace>,
    
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub owner_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = buyer_token_account.mint,
        associated_token::authority = marketplace
    )]
    pub marketplace_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateListingPrice<'info> {
    #[account(
        mut,
        seeds = [b"listing", listing.id.to_le_bytes().as_ref()],
        bump = listing.bump,
        has_one = owner
    )]
    pub listing: Account<'info, DataListing>,
    
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct CancelListing<'info> {
    #[account(
        mut,
        seeds = [b"listing", listing.id.to_le_bytes().as_ref()],
        bump = listing.bump,
        has_one = owner
    )]
    pub listing: Account<'info, DataListing>,
    
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct WithdrawFees<'info> {
    #[account(
        mut,
        seeds = [b"marketplace"],
        bump = marketplace.bump,
        has_one = authority
    )]
    pub marketplace: Account<'info, Marketplace>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(mut)]
    pub marketplace_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = marketplace_token_account.mint,
        associated_token::authority = authority
    )]
    pub authority_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Marketplace {
    pub authority: Pubkey,
    pub fee_basis_points: u16,
    pub total_listings: u64,
    pub total_volume: u64,
    pub bump: u8,
}

impl Marketplace {
    pub const LEN: usize = 8 + 32 + 2 + 8 + 8 + 1;
}

#[account]
pub struct DataListing {
    pub id: u64,
    pub owner: Pubkey,
    pub price: u64,
    pub data_type: DataType,
    pub description: String,
    pub is_active: bool,
    pub created_at: i64,
    pub sold_at: Option<i64>,
    pub cancelled_at: Option<i64>,
    pub buyer: Option<Pubkey>,
    pub bump: u8,
}

impl DataListing {
    pub const LEN: usize = 8 + 8 + 32 + 8 + 1 + 4 + 1 + 8 + 1 + 8 + 1 + 8 + 1 + 32 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum DataType {
    LocationHistory,
    AppUsage,
    PurchaseHistory,
    HealthData,
    SocialMediaActivity,
    SearchHistory,
    Custom(String),
}

#[error_code]
pub enum ErrorCode {
    #[msg("Listing is not active")]
    ListingNotActive,
    #[msg("Invalid listing ID")]
    InvalidListingId,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Invalid price")]
    InvalidPrice,
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
}
