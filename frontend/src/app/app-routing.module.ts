import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login.component';
import { RegisterComponent } from './pages/auth/register.component';
import { RequestsListComponent } from './pages/requests/requests-list.component';
import { CreateRequestComponent } from './pages/requests/create-request.component';
import { RequestDetailsComponent } from './pages/quotes/request-details.component';
import { MyQuotesComponent } from './pages/quotes/my-quotes.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'requests',
    component: RequestsListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'requests/:id',
    component: RequestDetailsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'create-request',
    component: CreateRequestComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'resident' }
  },
  {
    path: 'my-quotes',
    component: MyQuotesComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'provider' }
  },
  { path: '', redirectTo: '/requests', pathMatch: 'full' },
  { path: '**', redirectTo: '/requests', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
