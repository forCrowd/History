import { Component, NgModule } from "@angular/core";

import { AccountModule } from "./account/account.module";
import { AppCoreModule } from "./core/app-core.module";
import { NotFoundModule } from "./not-found/not-found.module";

// App component
@Component({
  selector: "app",
  template: "<core></core>"
})
export class AppComponent { }

// App module
@NgModule({
  bootstrap: [
    AppComponent
  ],
  declarations: [
    AppComponent
  ],
  imports: [
    AccountModule,
    AppCoreModule,
    NotFoundModule // Catch-all route
  ]
})
export class AppModule { }
