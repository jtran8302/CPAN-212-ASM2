import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/auth/login.component';
import { RegisterComponent } from './pages/auth/register.component';
import { RequestsListComponent } from './pages/requests/requests-list.component';
import { CreateRequestComponent } from './pages/requests/create-request.component';
import { RequestDetailsComponent } from './pages/quotes/request-details.component';
import { MyQuotesComponent } from './pages/quotes/my-quotes.component';
import { NavbarComponent } from './components/navbar.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    RequestsListComponent,
    CreateRequestComponent,
    RequestDetailsComponent,
    MyQuotesComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
