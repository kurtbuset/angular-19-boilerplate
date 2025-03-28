import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AccountService } from '@app/_services';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private accountService: AccountService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            catchError((err: HttpErrorResponse) => {
                if ([401, 403].includes(err.status) && this.accountService.accountValue) {
                    // auto logout if 401 Unauthorized or 403 Forbidden response returned from API
                    this.accountService.logout();
                }

                const error = (err && err.error?.message || err.statusText;
                    console.error(err);
                // Optionally, you can log the error to an external service here
                    return throwError(error); 
            }))
        
    }
}