import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() variant: 'default' | 'primary' | 'accent' = 'default';

  getCardClasses(): string {
    if (this.variant === 'primary') {
      return 'glass-card ';
    } else if (this.variant === 'accent') {
      return 'glass-card-accent ';
    }
    return 'bg-white/40 border border-slate-200/80 rounded-2xl dark:bg-dark-900/40 dark:border-dark-800/80 ';
  }
}
