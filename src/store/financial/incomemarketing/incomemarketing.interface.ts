export interface IncomeMarketingAllDataInterface {
    Date: string;
    PartyName: string;
    User: string;
    Income: string;
    Amount: string;
    DueAmount: string;
    PaymentMethode: string;
    Status: string;
}
export interface IncomeMarketingGetDataInterface {
    _id: string;
    Date: string;
    PartyName: string;
    User: string;
    Income: string;
    Amount: string;
    DueAmount: string;
    PaymentMethode: string;
    Status: string;
}

export interface IncomeMarketingAdvInterface {
    _id: string;
    User: string[];
    Income: string[],
    PaymentMethode: string[],
    Keyword: string,
    Limit: string[],
}
export interface IncomeMarketingDialogDataInterface {
    id: string;
    PartyName: string;
    Amount: string;
}