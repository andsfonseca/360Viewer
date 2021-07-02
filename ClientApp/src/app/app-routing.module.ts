import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { CanvasComponent } from './canvas/canvas.component';

const routes: Routes = [
  {
    path: '', component: AppComponent, children: [
      { path: '', component: CanvasComponent, pathMatch: 'full' },
    ],
  },
  
  // { path: '', component: AppComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
