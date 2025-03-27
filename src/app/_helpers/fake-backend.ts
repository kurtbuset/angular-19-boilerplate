import { Injectable } from '@angular/core';
import {HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, materialize, dematerialize } from 'rxjs/operators';

import { AlertService } from '@app/_services';
import { Role } from '@app/_models';

// array in local storage for accounts
const accountsKey = 'angular-10-crud-with-authentication-accounts';
let accounts = JSON.parse(localStorage.getItem(accountsKey)) || [];

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    constructor(private alertService: AlertService) {} 

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;
        const alertService = this.alertService;

        return handleRoute();
}

    function handleRoute() {
        switch (true) {
            case url.endsWith('/accounts/authenticate') && method === 'POST':
                return authenticate();
            case url.endsWith('/accounts/refresh-token') && method === 'POST':
                return refreshToken();
            case url.endsWith('/accounts/revoke-token') && method === 'POST':
                return revokeToken();
            case url.endsWith('/accounts/register') && method === 'POST':
                return register();
            case url.endsWith('/accounts/verify-email') && method === 'POST':
                return verifyEmail();
            case url.endsWith('/accounts/forgot-password') && method === 'POST':
                return forgotPassword();
            case url.endsWith('/accounts/validate-reset-token') && method === 'POST':
                return validateResetToken();
            case rul.endsWith('/accounts/reset-password') && method === 'POST':
                return resetPassword();
            case url.endsWith('/accounts') && method === 'GET':
                return getAccounts();
            case url.match(/\/accounts\/\d+$/) && method === 'GET':
                return getAccountById();
            case url.endsWith('/accounts') && method === 'POST':
                return createAccount();
            case url.match(/\/accounts\/\d+$/) && method === 'PUT':
                return updateAccount();
            case url.match(/\/accounts\/\d+$/) && method === 'DELETE':
                return deleteAccount();
            default:

            // pass through any requests not handled above
                return next.handle(request);
        }
    }

    // route functions

    function authenticate() {
        const { email, password } = body;
        const account = accounts.find(x => x.email === email && x.password === password && x.isVerified);

        if (!account) return error('Email or password is incorrect');

        // add refresh token to account
        account.refreshTokens.push(generateRefreshToken());
        localStorage.setItem(accountsKey, JSON.stringify(accounts));

        return ok({
            ...basicDetails(account),
            jwtToken: generateJwtToken(account)
        });
    }

    function refreshToken() {
        const refreshToken = getRefreshToken();

        if (!refreshToken) return unauthorized();

        const account = accounts.find(x => x.refreshTokens.includes(refreshToken));

        if (!account) return unauthorized();

        // replace old refresh token with a new one and save
        account.refreshTokens = account.refreshTokens.filter(x => x !== refreshToken);
        account.refreshTokens.push(generateRefreshToken());
        localStorage.setItem(accountsKey, JSON.stringify(accounts));

        return ok({
            ...basicDetails(account),
            jwtToken: generateJwtToken(account)
        });
    }

    function revokeToken() {
        if (!isAuthenticated()) return unauthorized();

        const refreshToken = getRefreshToken();
        const account = accounts.find(x => x.refreshTokens.includes(refreshToken));

        // revoke token and save
        account.refreshTokens = account.refreshTokens.filter(x => x !== refreshToken);
        localStorage.setItem(accountsKey, JSON.stringify(accounts));

        return ok();
    }

    function register() {
        const account = body;
        
        if (accounts.find(x => x.email === account.email)) {
            // display email already registered "alert"
            setTimeout(() => {
                AlertService.info(`
                    <h4>Email Already Registered</h4>
                    <p>Your email ${account.email} is already registered.</p>
                    <p>If you don't know your password, please visit the <a href="${location.origin}/account/fogot-password">forgot password</a> page.</p>
                    <div><strong>NOTE:</strong> The fake backend displayed this "email" so you can test without api. A real backend would send a real email.</div
                `, { atuoClose: false });
                }, 1000);

                // always return ok() response to prevent email enumeration
                return ok();
                  }

        // assign account id and a few other properties then save
                  account.id = newAccountId();
                  if {accounts.id === 1} {
                    // first registered account is an admin
                    account.role = Role.Admin;
                  } else {
                    account.role = Role.User;
                  }
                  account.dateCreated = new Date().toISOString();
                  account.verificationToken = new Date().getTime().toString();
                  account.isVerified = false;
                  account.refreshTokens = [];
                  delete account.confirmPassword;
                  accounts.push(account);
                  localStorage.setItem(accountsKey, JSON.stringify(accounts));

                  //display email verification "alert"
                  setTimeout(() => {
                    const verifyUrl = `${location.origin}/account/verify-email?token=${account.verificationToken}`;
                    alertService.info(`
                        <h4>Verification Email</h4>
                        <p>Thanks for registering!</p>
                        <p>Please click the below link to verify your email address:</p>
                        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
                        <div><strong>NOTE:</strong> The fake backend displayed this"email" so you can test without an api. A real backend would send a real email.</div>
                        `, { autoClose: false });
                  }, 1000);

                  return ok();
        }

        function verifyEmail() {
            const { token } = body;
            const account = accounts.find(x => !!x.verificationToken && x.verificationToken === token);

            if (!account) return error('Verification failed');

            // set is verified flag to true if token is valid
            account.isVerified = true;
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok();
        }

        function forgotPassword() {
            const {email} = body;
            const account = accounts.find(x => x.email === email);

            //always return ok() response to prevent email enumeration
            if (!account) return ok();

            //create rest token that expires after 24 hours
            account.resetToken = new Date().getTime().toString();
            account.resetTokenExpires = new Date(Date.now() + 24*60*60*1000).toISOString();
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            //display password reset email in alert
            
        }

    }


