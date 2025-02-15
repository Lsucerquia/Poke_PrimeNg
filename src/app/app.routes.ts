import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/animation/animation.component').then(m => m.AnimationComponent)
    }
];
