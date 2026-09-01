import { Directive, ElementRef, Input, OnInit, Renderer2, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appCountUp]',
  standalone: true
})
export class CountUpDirective implements OnInit, OnChanges {
  @Input('appCountUp') targetValue!: number | string;
  @Input() duration: number = 2000;
  @Input() isDecimal: boolean = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.animateCount();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['targetValue'] && !changes['targetValue'].isFirstChange()) {
      this.animateCount();
    }
  }

  private animateCount() {
    const targetStr = String(this.targetValue).replace(/,/g, '');
    const target = parseFloat(targetStr);
    
    if (isNaN(target)) {
      this.renderer.setProperty(this.el.nativeElement, 'innerHTML', this.targetValue);
      return;
    }

    const start = 0;
    const startTime = performance.now();

    const updateCounter = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / this.duration, 1);
      
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentVal = start + (target - start) * easeProgress;
      
      this.renderer.setProperty(this.el.nativeElement, 'innerHTML', this.formatValue(currentVal));

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        this.renderer.setProperty(this.el.nativeElement, 'innerHTML', this.formatValue(target));
      }
    };

    requestAnimationFrame(updateCounter);
  }

  private formatValue(val: number): string {
    if (this.isDecimal) {
      return val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return Math.floor(val).toLocaleString('en-IN');
  }
}
