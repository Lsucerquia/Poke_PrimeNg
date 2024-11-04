import { ChangeDetectionStrategy, Component, OnDestroy, computed, effect, signal } from '@angular/core';
import { PokemonService } from '../../services/pokemon.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-animation',
  standalone: true,
  imports: [
    HttpClientModule, 
    CommonModule,
    ToastModule,
    InputTextModule,
    ButtonModule,
    FormsModule
  ],
  providers: [
    PokemonService, 
    MessageService
  ],
  templateUrl: './animation.component.html',
  styleUrls: ['./animation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnimationComponent implements OnDestroy {
  pokemonNameOrId = signal('');
  loading = signal(false);
  pokemonData = signal<any>(null);
  animationArray = signal<string[]>([]);
  indiceActual = signal(0);
  animating = signal(false);
  timeoutId: any;

   // Propiedad intermedia para ngModel
   get pokemonName(): string {
    return this.pokemonNameOrId();
  }
  
  set pokemonName(value: string) {
    this.updateName(value);
  }

 
  imagenActual = computed(() => {
    const array = this.animationArray();
    return array.length > 0 ? array[this.indiceActual()] : '';
  });

  constructor(
    private pokemonService: PokemonService,
    private messageService: MessageService 
  ) {
    effect(() => {
      if (this.animating()) {
        this.animateFrames();
      }
    });
  }

  ngOnDestroy(): void {
    this.detenerAnimacion();
    clearTimeout(this.timeoutId);
  }

  playSound(soundSource: string) {
    const audio = new Audio(soundSource);
    audio.load();
    audio.play();
  }

  loadPokemon() {
    const input = this.pokemonNameOrId();

    if (input && input.length > 0) {
        this.detenerAnimacion();
        this.loading.set(true);

        this.pokemonService.getPokemon(input).subscribe({
            next: (pokemon: any) => {
              console.log('Pokemon recibido:', pokemon); 
                this.pokemonData.set(pokemon);
                this.loading.set(false);
                this.animationArray.set([
                    pokemon.sprites.front_default,
                    pokemon.sprites.back_default
                ]);
                this.iniciarAnimacion();
                this.playSound(this.pokemonData().cries.latest);
            },
            error: (err: any) => {
                console.error('Error al cargar el Pokémon:', err);
                this.showError('Nombre o ID de Pokémon no válido'); 
                this.loading.set(false);
            }
        });
    } else {
        this.showError('Escriba un nombre o ID para cargar');
    }
}

  showError(message: string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message, life: 3000 });
  }

  iniciarAnimacion() {
    this.indiceActual.set(0);
    this.animating.set(true);
  }

  animateFrames() {
    this.timeoutId = setTimeout(() => {
      if (this.animating()) {
        this.indiceActual.update(index => (index + 1) % this.animationArray().length);
        this.animateFrames();
      }
    }, 300);
  }

  detenerAnimacion() {
    this.animating.set(false);
  }

  updateName(name: string) {
    this.pokemonNameOrId.set(name.toLocaleLowerCase());
  }
  
}


function withFetch(): any {
  throw new Error('Function not implemented.');
}



