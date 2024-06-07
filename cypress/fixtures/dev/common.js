
const common = {
    // Admin creds
    adminEmail: "jester@orientalwallet.com",
    adminPass: "aaBB1010!!",
    randomString: "asd123!!",

    //login page
    login_url: "https://develop.paystage.net/login",
    login_pagetitle: "Log in - Paystage",
    login_login_text: "Login",
    login_email_text: "Email address",
    login_pass_text: "Password",
    login_submitbutton_text: "Sign in",
    login_forgotpass_text: "Forgot password?",
    login_createacc_text: "Create an account",

    //dashboard page
    dashboard_url: "https://develop.paystage.net/",
    dashboard_pagetitle: "Welcome - Paystage",
    requestURLbalance: "https://develop.paystage.net/accounts/balances?page=1&limit=20&solution=&type=",
    requestURLadminPermissions: "https://develop.paystage.net/users/2366313061/permissions",
    dashboard_export_auth: "https://develop.paystage.net/broadcasting/auth",
    dashboard_export_response: "https://develop.paystage.net/accounts/balances/export",

    //merchants page
    merchants_url: "https://develop.paystage.net/a/merchants",
    merchants_pagetitle: "Merchants - Paystage",
    merchantsURLpagination: "https://develop.paystage.net/a/merchants/get?limit=20&page=1&keyword=",
    merchantsURLAdminPermissions: "https://develop.paystage.net/users/2366313061/permissions",
    
    //accounts page
    accounts_url: "https://develop.paystage.net/accounts",
    accounts_pagetitle: "Accounts - Paystage",
    accountsURLpagination: "https://develop.paystage.net/accounts/get?limit=20&page=1&type=&integration_status=&kyc_status=",
    accountsURLAdminPermissions: "https://develop.paystage.net/users/2366313061/permissions",

    //default fee
    requestURLtransaction: "https://develop.paystage.net/a/default/exempted-accounts/pearlpay?defaultType=transaction_fee&type=deposit",
    requestURLsettlement: "https://develop.paystage.net/a/default/exempted-accounts/pearlpay?defaultType=transaction_fee&type=settlement",
    requestDefaultFee: "https://develop.paystage.net/a/default/fee-settings"
}

module.exports = {common}

