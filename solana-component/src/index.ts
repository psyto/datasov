import {
    Connection,
    PublicKey,
    Keypair,
    Transaction,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { Program, AnchorProvider, Wallet, BN, Idl } from "@coral-xyz/anchor";
import {
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    getAccount,
} from "@solana/spl-token";
import { DataSovSolana } from "./types/datasov_solana";
import idl from "./idl/datasov_solana.json";

export interface DataSovConfig {
    rpcUrl: string;
    programId: PublicKey;
    marketplaceFeeBasisPoints?: number;
}

export interface DataListing {
    id: number;
    owner: PublicKey;
    price: BN;
    dataType: DataType;
    description: string;
    isActive: boolean;
    createdAt: number;
    soldAt?: number;
    cancelledAt?: number;
    buyer?: PublicKey;
}

export enum DataType {
    LocationHistory = "LocationHistory",
    AppUsage = "AppUsage",
    PurchaseHistory = "PurchaseHistory",
    HealthData = "HealthData",
    SocialMediaActivity = "SocialMediaActivity",
    SearchHistory = "SearchHistory",
    Custom = "Custom",
}

export class DataSovClient {
    private connection: Connection;
    private program: Program<DataSovSolana>;
    private programId: PublicKey;
    private marketplacePDA: PublicKey;
    private marketplaceBump: number;

    constructor(config: DataSovConfig, wallet?: Wallet) {
        this.connection = new Connection(config.rpcUrl, "confirmed");
        this.programId = config.programId;

        // Derive marketplace PDA
        [this.marketplacePDA, this.marketplaceBump] =
            PublicKey.findProgramAddressSync(
                [Buffer.from("marketplace")],
                this.programId
            );

        if (wallet) {
            const provider = new AnchorProvider(this.connection, wallet, {});
            this.program = new Program(idl as Idl, this.programId, provider);
        } else {
            // For read-only operations
            this.program = new Program(idl as Idl, this.programId, {
                connection: this.connection,
            } as any);
        }
    }

    /**
     * Initialize the DataSov marketplace
     */
    async initializeMarketplace(
        authority: Keypair,
        feeBasisPoints: number = 250 // 2.5% default fee
    ): Promise<string> {
        const tx = new Transaction();

        const initializeIx = await this.program.methods
            .initializeMarketplace(feeBasisPoints)
            .accounts({
                marketplace: this.marketplacePDA,
                authority: authority.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .instruction();

        tx.add(initializeIx);

        const signature = await this.connection.sendTransaction(tx, [
            authority,
        ]);
        await this.connection.confirmTransaction(signature);

        return signature;
    }

    /**
     * Create a new data listing
     */
    async createDataListing(
        owner: Keypair,
        listingId: number,
        price: number,
        dataType: DataType,
        description: string
    ): Promise<string> {
        const [listingPDA] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("listing"),
                new BN(listingId).toArrayLike(Buffer, "le", 8),
            ],
            this.programId
        );

        const tx = new Transaction();

        const createListingIx = await this.program.methods
            .createDataListing(
                new BN(listingId),
                new BN(price),
                { [dataType]: {} },
                description
            )
            .accounts({
                listing: listingPDA,
                marketplace: this.marketplacePDA,
                owner: owner.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .instruction();

        tx.add(createListingIx);

        const signature = await this.connection.sendTransaction(tx, [owner]);
        await this.connection.confirmTransaction(signature);

        return signature;
    }

    /**
     * Purchase data from a listing
     */
    async purchaseData(
        buyer: Keypair,
        listingId: number,
        mint: PublicKey
    ): Promise<string> {
        const [listingPDA] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("listing"),
                new BN(listingId).toArrayLike(Buffer, "le", 8),
            ],
            this.programId
        );

        // Get listing details
        const listing = await this.getListing(listingId);
        if (!listing) {
            throw new Error("Listing not found");
        }

        const buyerTokenAccount = await getAssociatedTokenAddress(
            mint,
            buyer.publicKey
        );

        const ownerTokenAccount = await getAssociatedTokenAddress(
            mint,
            listing.owner
        );

        const marketplaceTokenAccount = await getAssociatedTokenAddress(
            mint,
            this.marketplacePDA
        );

        const tx = new Transaction();

        // Check if buyer has token account, create if not
        try {
            await getAccount(this.connection, buyerTokenAccount);
        } catch {
            tx.add(
                createAssociatedTokenAccountInstruction(
                    buyer.publicKey,
                    buyerTokenAccount,
                    buyer.publicKey,
                    mint
                )
            );
        }

        const purchaseIx = await this.program.methods
            .purchaseData(new BN(listingId))
            .accounts({
                listing: listingPDA,
                marketplace: this.marketplacePDA,
                buyer: buyer.publicKey,
                buyerTokenAccount,
                ownerTokenAccount,
                marketplaceTokenAccount,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .instruction();

        tx.add(purchaseIx);

        const signature = await this.connection.sendTransaction(tx, [buyer]);
        await this.connection.confirmTransaction(signature);

        return signature;
    }

    /**
     * Update listing price
     */
    async updateListingPrice(
        owner: Keypair,
        listingId: number,
        newPrice: number
    ): Promise<string> {
        const [listingPDA] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("listing"),
                new BN(listingId).toArrayLike(Buffer, "le", 8),
            ],
            this.programId
        );

        const tx = new Transaction();

        const updatePriceIx = await this.program.methods
            .updateListingPrice(new BN(newPrice))
            .accounts({
                listing: listingPDA,
                owner: owner.publicKey,
            })
            .instruction();

        tx.add(updatePriceIx);

        const signature = await this.connection.sendTransaction(tx, [owner]);
        await this.connection.confirmTransaction(signature);

        return signature;
    }

    /**
     * Cancel a listing
     */
    async cancelListing(owner: Keypair, listingId: number): Promise<string> {
        const [listingPDA] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("listing"),
                new BN(listingId).toArrayLike(Buffer, "le", 8),
            ],
            this.programId
        );

        const tx = new Transaction();

        const cancelIx = await this.program.methods
            .cancelListing()
            .accounts({
                listing: listingPDA,
                owner: owner.publicKey,
            })
            .instruction();

        tx.add(cancelIx);

        const signature = await this.connection.sendTransaction(tx, [owner]);
        await this.connection.confirmTransaction(signature);

        return signature;
    }

    /**
     * Withdraw marketplace fees
     */
    async withdrawFees(
        authority: Keypair,
        amount: number,
        mint: PublicKey
    ): Promise<string> {
        const marketplaceTokenAccount = await getAssociatedTokenAddress(
            mint,
            this.marketplacePDA
        );

        const authorityTokenAccount = await getAssociatedTokenAddress(
            mint,
            authority.publicKey
        );

        const tx = new Transaction();

        const withdrawIx = await this.program.methods
            .withdrawFees(new BN(amount))
            .accounts({
                marketplace: this.marketplacePDA,
                authority: authority.publicKey,
                marketplaceTokenAccount,
                authorityTokenAccount,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .instruction();

        tx.add(withdrawIx);

        const signature = await this.connection.sendTransaction(tx, [
            authority,
        ]);
        await this.connection.confirmTransaction(signature);

        return signature;
    }

    /**
     * Get marketplace information
     */
    async getMarketplace(): Promise<any> {
        try {
            const marketplace = await this.program.account.marketplace.fetch(
                this.marketplacePDA
            );
            return marketplace;
        } catch (error) {
            return null;
        }
    }

    /**
     * Get listing information
     */
    async getListing(listingId: number): Promise<DataListing | null> {
        try {
            const [listingPDA] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from("listing"),
                    new BN(listingId).toArrayLike(Buffer, "le", 8),
                ],
                this.programId
            );

            const listing = await this.program.account.dataListing.fetch(
                listingPDA
            );
            return {
                id: listing.id.toNumber(),
                owner: listing.owner,
                price: listing.price,
                dataType: this.parseDataType(listing.dataType),
                description: listing.description,
                isActive: listing.isActive,
                createdAt: listing.createdAt.toNumber(),
                soldAt: listing.soldAt?.toNumber(),
                cancelledAt: listing.cancelledAt?.toNumber(),
                buyer: listing.buyer,
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Get all active listings
     */
    async getAllListings(): Promise<DataListing[]> {
        try {
            const listings = await this.program.account.dataListing.all();
            return listings.map((listing) => ({
                id: listing.account.id.toNumber(),
                owner: listing.account.owner,
                price: listing.account.price,
                dataType: this.parseDataType(listing.account.dataType),
                description: listing.account.description,
                isActive: listing.account.isActive,
                createdAt: listing.account.createdAt.toNumber(),
                soldAt: listing.account.soldAt?.toNumber(),
                cancelledAt: listing.account.cancelledAt?.toNumber(),
                buyer: listing.account.buyer,
            }));
        } catch (error) {
            return [];
        }
    }

    /**
     * Get active listings only
     */
    async getActiveListings(): Promise<DataListing[]> {
        const allListings = await this.getAllListings();
        return allListings.filter((listing) => listing.isActive);
    }

    /**
     * Get listings by data type
     */
    async getListingsByDataType(dataType: DataType): Promise<DataListing[]> {
        const allListings = await this.getAllListings();
        return allListings.filter((listing) => listing.dataType === dataType);
    }

    /**
     * Get listings by owner
     */
    async getListingsByOwner(owner: PublicKey): Promise<DataListing[]> {
        const allListings = await this.getAllListings();
        return allListings.filter((listing) => listing.owner.equals(owner));
    }

    private parseDataType(dataType: any): DataType {
        if (dataType.locationHistory) return DataType.LocationHistory;
        if (dataType.appUsage) return DataType.AppUsage;
        if (dataType.purchaseHistory) return DataType.PurchaseHistory;
        if (dataType.healthData) return DataType.HealthData;
        if (dataType.socialMediaActivity) return DataType.SocialMediaActivity;
        if (dataType.searchHistory) return DataType.SearchHistory;
        if (dataType.custom) return DataType.Custom;
        return DataType.Custom;
    }

    /**
     * Get program-derived addresses
     */
    getMarketplacePDA(): PublicKey {
        return this.marketplacePDA;
    }

    getListingPDA(listingId: number): PublicKey {
        const [listingPDA] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("listing"),
                new BN(listingId).toArrayLike(Buffer, "le", 8),
            ],
            this.programId
        );
        return listingPDA;
    }
}

// Export types and enums
export { DataType };
export type { DataListing, DataSovConfig };
