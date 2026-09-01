import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccessibilityService, AccessibilityState } from '../../../core/services/accessibility.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-accessibility-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accessibility-panel.component.html',
  styleUrls: ['./accessibility-panel.component.css']
})
export class AccessibilityPanelComponent {
  isOpen = false;
  
  state$: Observable<AccessibilityState>;

  constructor(public access: AccessibilityService) {
    this.state$ = this.access.state$;
  }

  togglePanel() {
    this.isOpen = !this.isOpen;
  }

  cycleSmallerText() {
    // We will adjust the service to handle negative text size
    // For now, we'll implement it locally and update the service state
    let s: any;
    this.state$.subscribe(v => s = v).unsubscribe();
    let newSize = s.textSize;
    if (newSize > 0) newSize = 0; // reset positive
    newSize = newSize <= -3 ? 0 : newSize - 1;
    // We can't call updateState directly since it's private. Let's add cycleSmallerText to service in next step.
    (this.access as any).updateState({ ...s, textSize: newSize });
  }

  cycleBiggerText() {
    let s: any;
    this.state$.subscribe(v => s = v).unsubscribe();
    let newSize = s.textSize;
    if (newSize < 0) newSize = 0; // reset negative
    newSize = newSize >= 3 ? 0 : newSize + 1;
    (this.access as any).updateState({ ...s, textSize: newSize });
  }
}
