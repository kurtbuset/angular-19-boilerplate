import { AccountService } from '@app/_services';
import { resolve } from 'path';

export function appInitializer(accountService: AccountService){
    return () => new Promise(resolve =>{

        accountService.refereshToken()
        .subscribe()
        .add(resolve);
        
        
    });
}

// This function is used to initialize the application by refreshing the token before the application starts.