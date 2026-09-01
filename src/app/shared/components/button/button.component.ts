import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css'
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'accent' | 'outline' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' = 'button';
  
  @Output() btnClick = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent) {
    if (!this.disabled) {
      this.btnClick.emit(event);
    }
  }

  getButtonClasses(): string {
    let classes = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 gap-2 ';
    
    // Variant
    if (this.variant === 'primary') {
      classes += 'btn-gradient-primary text-white ';
    } else if (this.variant === 'accent') {
      classes += 'btn-gradient-accent text-white ';
    } else if (this.variant === 'outline') {
      classes += 'btn-outline ';
    }

    // Size
    if (this.size === 'sm') {
      classes += 'px-3.5 py-1.5 text-xs ';
    } else if (this.size === 'md') {
      classes += 'px-5 py-2.5 text-sm ';
    } else if (this.size === 'lg') {
      classes += 'px-7 py-3 text-base ';
    }

    // Disabled state
    if (this.disabled) {
      classes += 'opacity-50 cursor-not-allowed pointer-events-none ';
    }

    return classes;
  }
}
