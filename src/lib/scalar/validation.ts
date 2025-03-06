import { CreateDeployTokenParams, CreateProtocolParams } from "./params";

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export const validateRequired = <T>(value: T | null | undefined, fieldName: string): T => {
    if (value === null || value === undefined || value === '') {
        throw new ValidationError(`${fieldName} is required`);
    }
    return value;
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const validateAsset = (asset: any): void => {
    validateRequired(asset, 'asset');
    validateRequired(asset.chain, 'asset.chain');
    validateRequired(asset.symbol, 'asset.symbol');
};

export const validateProtocolParams = (params: CreateProtocolParams): void => {
    try {
        validateRequired(params.bitcoin_pubkey, 'bitcoin_pubkey');
        validateRequired(params.name, 'name');
        validateRequired(params.tag, 'tag');
        validateRequired(params.custodian_group_uid, 'custodian_group_uid');
        validateRequired(params.avatar, 'avatar');
        validateRequired(params.token_decimals, 'token_decimals');
        validateRequired(params.token_capacity, 'token_capacity');
        validateAsset(params.asset);
        validateRequired(params.attributes?.model, 'attributes.model');
    } catch (error) {
        if (error instanceof ValidationError) {
            throw error.message;
        }
        throw 'Invalid parameters';
    }
};

export const validateCreateDeployTokenParams = (params: CreateDeployTokenParams): void => {
    try {
        validateRequired(params.chain, 'chain');
        validateRequired(params.token_symbol, 'asset');
    } catch (error) {
        if (error instanceof ValidationError) {
            throw error.message;
        }
        throw 'Invalid parameters';
    }
}