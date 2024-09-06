export interface RegisterPostRequest {
    member_id:       number;
    username: string;
    email : string;
    password: string;
    conpassword : string;
    newpassword : string;
    wallet_balance : number;
    type: string;
}
